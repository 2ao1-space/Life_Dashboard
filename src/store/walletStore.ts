import { create } from "zustand";
import { getDB } from "@/lib/db";
import { isIncomeType } from "@/lib/utils";
import { DEFAULT_WALLETS } from "@/types";
import type { Wallet, WalletId, Transaction } from "@/types";

function loadStoredWallets(): Wallet[] {
  if (typeof window === "undefined") return DEFAULT_WALLETS;
  try {
    const raw = localStorage.getItem("_wallets");
    return raw ? JSON.parse(raw) : DEFAULT_WALLETS;
  } catch {
    return DEFAULT_WALLETS;
  }
}
function saveWallets(w: Wallet[]) {
  if (typeof window !== "undefined")
    localStorage.setItem("_wallets", JSON.stringify(w));
}

interface WalletState {
  wallets: Wallet[];
  walletBalances: Record<WalletId, number>;
  totalBalance: number;
  loadWallets: () => void;
  computeBalances: (upToDate?: string) => Promise<void>;
  addWallet: (name: string, icon: string, color: string) => void;
  removeWallet: (id: WalletId) => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: DEFAULT_WALLETS,
  walletBalances: {},
  totalBalance: 0,

  loadWallets: () => set({ wallets: loadStoredWallets() }),

  computeBalances: async (upToDate?) => {
    const db = getDB();
    const allTxs = upToDate
      ? await db.transactions.where("date").belowOrEqual(upToDate).toArray()
      : await db.transactions.toArray();

    const { wallets } = get();
    const balances: Record<WalletId, number> = {};
    wallets.forEach((w) => {
      balances[w.id] = 0;
    });

    for (const tx of allTxs) {
      const wid = tx.walletId || "cash";
      if (!(wid in balances)) balances[wid] = 0;
      balances[wid] += isIncomeType(tx.type) ? tx.amount : -tx.amount;
    }

    const total = Object.values(balances).reduce((a, b) => a + b, 0);
    set({ walletBalances: balances, totalBalance: total });
  },

  addWallet: (name, icon, color) => {
    const newWallet: Wallet = { id: "w_" + Date.now(), name, icon, color };
    const updated = [...get().wallets, newWallet];
    saveWallets(updated);
    set({ wallets: updated });
  },

  removeWallet: (id) => {
    if (id === "cash") return;
    const updated = get().wallets.filter((w) => w.id !== id);
    saveWallets(updated);
    set({ wallets: updated });
  },
}));
