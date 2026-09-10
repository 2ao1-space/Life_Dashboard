import TodayBento from "@/components/analytics/todayBento";
import MonthCalendar from "@/components/analytics/monthCalendar";
import MonthlyFinanceChart from "@/components/analytics/monthlyFinanceChart";

export default function AnalyticsPage() {
  return (
    <main className="mx-auto max-w-lg space-y-5 px-4 pb-28 pt-5">
      <section>
        <h2 className="mb-2 text-xs font-bold text-app-text-2">الكالندر </h2>
        <MonthCalendar />
      </section>
      <section>
        <h2 className="mb-2 text-xs font-bold text-app-text-2">
          الحركة المالية
        </h2>
        <MonthlyFinanceChart />
      </section>
      <TodayBento />
    </main>
  );
}
