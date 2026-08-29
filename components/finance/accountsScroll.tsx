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
      <div className="flex gap-2.5 overflow-x-auto pb-1">
        {accounts.map((account) => (
          <button
            key={account.id}
            type="button"
            onClick={() => setSelected(account)}
            className="min-w-[130px] shrink-0 rounded-card-md border border-app-border bg-app-surface p-3.5 text-right shadow-card"
          >
            <div className="mb-1.5 text-xs text-app-text-2">
              {account.icon} {account.name}
            </div>
            <div className="text-[15px] font-extrabold text-app-text">
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
