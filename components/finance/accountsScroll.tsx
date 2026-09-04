"use client";

import { useState } from "react";
import { useAccounts } from "@/hooks/useAccounts";
import AccountDetailModal from "./accountDetailModal";
import type { AccountEntity } from "@/types/settings";

export default function AccountsScroll() {
  const { accounts } = useAccounts();
  const [selected, setSelected] = useState<AccountEntity | null>(null);

  return (
    <>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {accounts.map((account) => (
          <button
            key={account.id}
            type="button"
            onClick={() => setSelected(account)}
            className="min-w-38.5 shrink-0 rounded-card-md border border-app-border bg-app-surface p-4 text-right shadow-card transition-transform active:scale-[.98]"
          >
            <div className="mb-5 truncate text-xs font-semibold text-app-text-2">
              {account.name}
            </div>
            <div className="text-base font-extrabold text-app-text">
              {account.balance.toLocaleString("ar-EG")} ج.م
            </div>
          </button>
        ))}
      </div>

      <AccountDetailModal
        account={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
