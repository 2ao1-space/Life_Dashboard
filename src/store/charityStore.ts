import { create } from "zustand";
import { getDB } from "@/lib/db";
import { today, currentMonthKey, prevMonthKey } from "@/lib/utils";
import type { CharityMonth, CharityPayment } from "@/types";

async function getMonthSalary(monthKey: string): Promise<number> {
  const [y, m] = monthKey.split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const end = `${y}-${String(m).padStart(2, "0")}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`;
  const txs = await getDB()
    .transactions.where("date")
    .between(start, end, true, true)
    .toArray();
  return txs
    .filter((t) => t.type === "salary")
    .reduce((s, t) => s + t.amount, 0);
}

interface CharityState {
  currentMonth: CharityMonth | null;
  currentPayments: CharityPayment[];
  allMonths: CharityMonth[];
  monthlySalary: number;
  loadCurrentMonth: () => Promise<void>;
  loadMonth: (monthKey: string) => Promise<void>;
  addPayment: (
    amount: number,
    recipient: string,
    note?: string,
    photo?: string,
  ) => Promise<void>;
  deletePayment: (id: number) => Promise<void>;
  loadAllMonths: () => Promise<void>;
}

export const useCharityStore = create<CharityState>((set, get) => ({
  currentMonth: null,
  currentPayments: [],
  allMonths: [],
  monthlySalary: 0,

  loadCurrentMonth: async () => get().loadMonth(currentMonthKey()),

  loadMonth: async (monthKey) => {
    const db = getDB();
    const pmk = prevMonthKey(monthKey);

    const [salary, prev] = await Promise.all([
      getMonthSalary(monthKey),
      db.charityMonths
        .where("[userId+monthKey]")
        .equals(["", pmk])
        .first()
        .catch(() => db.charityMonths.where("monthKey").equals(pmk).first()),
    ]);
    let carriedOver = 0;
    if (prev && prev.remaining > 0 && !prev.isClosed) {
      carriedOver = prev.remaining;
      await db.charityMonths.update(prev.id!, { isClosed: true });
    }

    const base = parseFloat((salary * 0.025).toFixed(2));
    const total = parseFloat((base + carriedOver).toFixed(2));

    let month = await db.charityMonths
      .where("monthKey")
      .equals(monthKey)
      .first();

    if (!month) {
      try {
        const id = await db.charityMonths.add({
          monthKey,
          salaryTotal: salary,
          required: base,
          carriedOver,
          totalRequired: total,
          paidAmount: 0,
          remaining: total,
          isClosed: total === 0,
          synced: false,
        });
        month = await db.charityMonths.get(id as number);
      } catch {
        month = await db.charityMonths
          .where("monthKey")
          .equals(monthKey)
          .first();
      }
    } else if (!month.isClosed) {
      const newRem = parseFloat(
        Math.max(0, total - month.paidAmount).toFixed(2),
      );
      await db.charityMonths.update(month.id!, {
        salaryTotal: salary,
        required: base,
        totalRequired: total,
        remaining: newRem,
        isClosed: newRem === 0 && total > 0,
      });
      month = await db.charityMonths.get(month.id!);
    }

    const payments = await db.charityPayments
      .where("monthKey")
      .equals(monthKey)
      .toArray();
    payments.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    set({
      currentMonth: month ?? null,
      currentPayments: payments,
      monthlySalary: salary,
    });
  },

  addPayment: async (amount, recipient, note, photo) => {
    const db = getDB();
    const mk = currentMonthKey();
    const month = get().currentMonth;
    if (!month || month.isClosed || month.totalRequired === 0) return;

    const actual = Math.min(amount, month.remaining);
    if (actual <= 0) return;

    await db.charityPayments.add({
      amount: actual,
      recipient,
      note,
      photoDataUrl: photo,
      date: today(),
      monthKey: mk,
      timestamp: new Date(),
      synced: false,
    });

    const newPaid = parseFloat((month.paidAmount + actual).toFixed(2));
    const newRem = parseFloat(
      Math.max(0, month.totalRequired - newPaid).toFixed(2),
    );
    await db.charityMonths.update(month.id!, {
      paidAmount: newPaid,
      remaining: newRem,
      isClosed: newRem === 0,
    });

    await get().loadCurrentMonth();
  },

  deletePayment: async (id) => {
    const db = getDB();
    const p = await db.charityPayments.get(id);
    if (!p) return;
    await db.charityPayments.delete(id);
    const month = await db.charityMonths
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
      await db.charityMonths.update(month.id!, {
        paidAmount: newPaid,
        remaining: newRem,
        isClosed: false,
      });
    }
    await get().loadCurrentMonth();
  },

  loadAllMonths: async () => {
    const all = await getDB().charityMonths.toArray();
    all.sort((a, b) => b.monthKey.localeCompare(a.monthKey));
    set({ allMonths: all });
  },
}));
