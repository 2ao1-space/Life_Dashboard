import { create } from "zustand";
import { getDB } from "@/lib/db";
import { today, currentMonthKey, prevMonthKey } from "@/lib/utils";
import {
  syncUpsertZakat,
  syncDeleteZakat,
  syncUpsertZakatMonth,
} from "@/lib/syncEngine";
import type { ZakatPayment, ZakatMonth } from "@/types";

export async function getMonthSalary(monthKey: string): Promise<number> {
  const db = getDB();
  const [y, m] = monthKey.split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const end = `${y}-${String(m).padStart(2, "0")}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`;
  const txs = await db.transactions
    .where("date")
    .between(start, end, true, true)
    .toArray();
  return txs
    .filter((t) => t.type === "salary")
    .reduce((s, t) => s + t.amount, 0);
}

export async function recalcZakatMonth(
  monthKey: string,
): Promise<ZakatMonth | null> {
  const db = getDB();
  const salary = await getMonthSalary(monthKey);
  const pmk = prevMonthKey(monthKey);

  let carriedOver = 0;
  const prev = await db.zakatMonths.where("monthKey").equals(pmk).first();
  if (prev && prev.remaining > 0 && !prev.isClosed)
    carriedOver = prev.remaining;

  const base = parseFloat((salary * 0.025).toFixed(2));
  const total = parseFloat((base + carriedOver).toFixed(2));

  let month = await db.zakatMonths.where("monthKey").equals(monthKey).first();
  if (!month) {
    const id = await db.zakatMonths.add({
      monthKey,
      salaryAmount: salary,
      baseRequired: base,
      carriedOver,
      totalRequired: total,
      paidAmount: 0,
      remaining: total,
      isClosed: total === 0,
      synced: false,
    });
    month = await db.zakatMonths.get(id as number);
  } else {
    const newRem = parseFloat(Math.max(0, total - month.paidAmount).toFixed(2));
    await db.zakatMonths.update(month.id!, {
      salaryAmount: salary,
      baseRequired: base,
      carriedOver,
      totalRequired: total,
      remaining: newRem,
      isClosed: newRem === 0 && total > 0,
      synced: false,
    });
    month = await db.zakatMonths.get(month.id!);
  }
  if (month?.id) syncUpsertZakatMonth(month as ZakatMonth & { id: number });
  return month ?? null;
}

interface ZakatState {
  currentMonth: ZakatMonth | null;
  currentPayments: ZakatPayment[];
  allMonths: ZakatMonth[];
  monthlySalary: number;
  loadCurrentMonth: () => Promise<void>;
  loadMonth: (monthKey: string) => Promise<void>;
  addPayment: (
    amount: number,
    recipient: string,
    note?: string,
    photo?: string,
    monthKey?: string,
  ) => Promise<void>;
  deletePayment: (id: number) => Promise<void>;
  loadAllMonths: () => Promise<void>;
}

export const useZakatStore = create<ZakatState>((set, get) => ({
  currentMonth: null,
  currentPayments: [],
  allMonths: [],
  monthlySalary: 0,

  loadCurrentMonth: async () => get().loadMonth(currentMonthKey()),

  loadMonth: async (monthKey) => {
    const db = getDB();
    const [month, payments, salary] = await Promise.all([
      recalcZakatMonth(monthKey),
      db.zakatPayments.where("monthKey").equals(monthKey).toArray(),
      getMonthSalary(monthKey),
    ]);
    payments.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    set({
      currentMonth: month,
      currentPayments: payments,
      monthlySalary: salary,
    });
  },

  addPayment: async (amount, recipient, note, photo, mKey) => {
    const db = getDB();
    const mk = mKey ?? currentMonthKey();
    const month =
      get().currentMonth?.monthKey === mk
        ? get().currentMonth
        : await db.zakatMonths.where("monthKey").equals(mk).first();

    if (!month || month.isClosed || month.totalRequired === 0) return;
    const actual = Math.min(amount, month.remaining);
    if (actual <= 0) return;

    const pid = await db.zakatPayments.add({
      amount: actual,
      recipient,
      note,
      photoDataUrl: photo,
      date: today(),
      monthKey: mk,
      timestamp: new Date(),
      synced: false,
    });
    const p = await db.zakatPayments.get(pid as number);
    if (p?.id) syncUpsertZakat(p as ZakatPayment & { id: number });

    const newPaid = parseFloat((month.paidAmount + actual).toFixed(2));
    const newRem = parseFloat(
      Math.max(0, month.totalRequired - newPaid).toFixed(2),
    );
    await db.zakatMonths.update(month.id!, {
      paidAmount: newPaid,
      remaining: newRem,
      isClosed: newRem === 0,
      synced: false,
    });
    const u = await db.zakatMonths.get(month.id!);
    if (u?.id) syncUpsertZakatMonth(u as ZakatMonth & { id: number });

    await get().loadMonth(mk);
  },

  deletePayment: async (id) => {
    const db = getDB();
    const p = await db.zakatPayments.get(id);
    if (!p) return;
    await db.zakatPayments.delete(id);
    syncDeleteZakat(id);
    const month = await db.zakatMonths
      .where("monthKey")
      .equals(p.monthKey)
      .first();
    if (month) {
      const newPaid = parseFloat(
        Math.max(0, month.paidAmount - p.amount).toFixed(2),
      );
      const newRem = parseFloat(
        Math.max(0, month.totalRequired - newPaid).toFixed(2),
      );
      await db.zakatMonths.update(month.id!, {
        paidAmount: newPaid,
        remaining: newRem,
        isClosed: false,
        synced: false,
      });
      const u = await db.zakatMonths.get(month.id!);
      if (u?.id) syncUpsertZakatMonth(u as ZakatMonth & { id: number });
    }
    await get().loadMonth(p.monthKey);
  },

  loadAllMonths: async () => {
    const all = await getDB().zakatMonths.toArray();
    all.sort((a, b) => b.monthKey.localeCompare(a.monthKey));
    set({ allMonths: all });
  },
}));
