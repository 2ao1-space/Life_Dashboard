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
    <main className="mx-auto max-w-md space-y-5 px-4 pb-28 pt-5">
      <h1 className="text-lg font-extrabold text-app-text">الماليات</h1>

      <TotalCard />

      <section>
        <h2 className="mb-2 text-xs font-bold text-app-text-2">
          الحسابات{" "}
          <span className="font-normal">— اضغط على أي حساب لتفاصيله</span>
        </h2>
        <AccountsScroll />
      </section>

      <section>
        <h2 className="mb-2 text-xs font-bold text-app-text-2">
          معاملات اليوم
        </h2>
        <TodayTransactionsList />
      </section>

      {settings?.debts_enabled && (
        <section>
          <h2 className="mb-2 text-xs font-bold text-app-text-2">
            الديون والسلف
          </h2>
          <DebtsSection />
        </section>
      )}

      {settings?.zakat_enabled && (
        <section>
          <h2 className="mb-2 text-xs font-bold text-app-text-2">الزكاة</h2>
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
