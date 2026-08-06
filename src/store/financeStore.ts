import { create } from "zustand";
import { getDB } from "@/lib/db";
import { today, isIncomeType, monthKeyFromDate } from "@/lib/utils";
import { syncUpsertTransaction, syncDeleteTransaction } from "@/lib/syncEngine";
import { recalcZakatMonth } from "@/store/zakatStore";
import type { Transaction, WalletId } from "@/types";

function isIncome(t: Transaction): boolean {
  return isIncomeType(t.type);
}

async function computeWalletBalances(): Promise<{
  balances: Record<WalletId, number>;
  total: number;
}> {
  const all = await getDB().transactions.toArray();
  const balances: Record<WalletId, number> = {};
  for (const tx of all) {
    const wid = tx.walletId || "cash";
    if (!(wid in balances)) balances[wid] = 0;
    balances[wid] += isIncome(tx) ? tx.amount : -tx.amount;
  }
  const total = Object.values(balances).reduce((a, b) => a + b, 0);
  return { balances, total };
}

interface FinanceState {
  transactions: Transaction[];
  isLoading: boolean;
  dayIncome: number;
  dayExpenses: number;
  walletBalances: Record<WalletId, number>;
  totalBalance: number;
  runningBalance: number;
  viewDate: string;
  loadTransactions: (date: string) => Promise<void>;
  addTransaction: (
    amount: number,
    type: Transaction["type"],
    walletId: WalletId,
    note?: string,
    date?: string,
  ) => Promise<void>;
  updateTransaction: (
    id: number,
    amount: number,
    walletId: WalletId,
    note?: string,
  ) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  refreshBalances: () => Promise<void>;
  searchTransactions: (query: string) => Promise<Transaction[]>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  isLoading: false,
  dayIncome: 0,
  dayExpenses: 0,
  walletBalances: {},
  totalBalance: 0,
  runningBalance: 0,
  viewDate: today(),

  loadTransactions: async (date) => {
    set({ isLoading: true, viewDate: date });
    try {
      const db = getDB();

      const [data, prev, { balances, total }] = await Promise.all([
        db.transactions.where("date").equals(date).toArray(),
        db.transactions.where("date").below(date).toArray(),
        computeWalletBalances(),
      ]);

      data.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      const dayInc = data.filter(isIncome).reduce((s, t) => s + t.amount, 0);
      const dayExp = data
        .filter((t) => !isIncome(t))
        .reduce((s, t) => s + t.amount, 0);
      const running =
        prev.filter(isIncome).reduce((s, t) => s + t.amount, 0) -
        prev.filter((t) => !isIncome(t)).reduce((s, t) => s + t.amount, 0);

      set({
        transactions: data,
        dayIncome: dayInc,
        dayExpenses: dayExp,
        runningBalance: running,
        walletBalances: balances,
        totalBalance: total,
        isLoading: false,
      });
    } catch (e) {
      console.error("loadTransactions error", e);
      set({ isLoading: false });
    }
  },

  addTransaction: async (amount, type, walletId, note, date?) => {
    const db = getDB();
    const dateStr = date ?? today();
    const id = await db.transactions.add({
      amount,
      type,
      walletId: walletId || "cash",
      note,
      timestamp: new Date(),
      date: dateStr,
      synced: false,
    });
    const tx = await db.transactions.get(id as number);
    if (tx?.id) syncUpsertTransaction(tx as Transaction & { id: number });
    if (type === "salary") await recalcZakatMonth(monthKeyFromDate(dateStr));
    await get().loadTransactions(get().viewDate);
  },

  updateTransaction: async (id, amount, walletId, note?) => {
    const db = getDB();
    const existing = await db.transactions.get(id);
    await db.transactions.update(id, {
      amount,
      walletId: walletId || "cash",
      note,
      synced: false,
    });
    const tx = await db.transactions.get(id);
    if (tx?.id) syncUpsertTransaction(tx as Transaction & { id: number });
    if (existing?.type === "salary" || tx?.type === "salary") {
      await recalcZakatMonth(monthKeyFromDate(tx?.date ?? today()));
    }
    await get().loadTransactions(get().viewDate);
  },

  deleteTransaction: async (id) => {
    const db = getDB();
    const tx = await db.transactions.get(id);
    await db.transactions.delete(id);
    syncDeleteTransaction(id);
    if (tx?.type === "salary")
      await recalcZakatMonth(monthKeyFromDate(tx.date));
    await get().loadTransactions(get().viewDate);
  },

  refreshBalances: async () => {
    const { balances, total } = await computeWalletBalances();
    set({ walletBalances: balances, totalBalance: total });
  },

  searchTransactions: async (query: string): Promise<Transaction[]> => {
    if (!query.trim()) return [];
    const all = await getDB().transactions.toArray();
    const q = query.toLowerCase();
    return all
      .filter((t) => t.note?.toLowerCase().includes(q))
      .sort((a, b) => b.date.localeCompare(a.date));
  },
}));
