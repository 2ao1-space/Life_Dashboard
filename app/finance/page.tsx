"use client";

import { useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import TotalCard from "@/components/finance/totalCard";
import AccountsScroll from "@/components/finance/accountsScroll";
import TodayTransactionsList from "@/components/finance/todayTransactionsList";
import TransactionFormModal from "@/components/finance/transactionFormModal";
import DebtsSection from "@/components/finance/debtsSection";
import ZakatSection from "@/components/finance/zakatSection";
import Fab from "@/components/shared/Fab";

export default function FinancePage() {
  const { settings } = useSettings();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const openAdd = () => {
    setFormKey((k) => k + 1);
    setIsAddOpen(true);
  };

  return (
    <main className="mx-auto max-w-lg space-y-6 px-4 pb-28 pt-5">
      <TotalCard />

      <section>
        <h2 className="mb-2 text-sm font-extrabold text-app-text">الحسابات</h2>
        <AccountsScroll />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-extrabold text-app-text">
          معاملات اليوم
        </h2>
        <TodayTransactionsList />
      </section>

      {settings?.debts_enabled && (
        <section>
          <h2 className="mb-2 text-sm font-extrabold text-app-text">
            الديون والسلف
          </h2>
          <DebtsSection />
        </section>
      )}

      {settings?.zakat_enabled && (
        <section>
          <h2 className="mb-2 text-sm font-extrabold text-app-text">الزكاة</h2>
          <ZakatSection />
        </section>
      )}

      <Fab label="معاملة جديدة" onClick={openAdd} />
      {isAddOpen && (
        <TransactionFormModal
          key={formKey}
          isOpen
          onClose={() => setIsAddOpen(false)}
        />
      )}
    </main>
  );
}
