import TodayBento from "@/components/analytics/todayBento";
import MonthCalendar from "@/components/analytics/monthCalendar";
import MonthlyFinanceChart from "@/components/analytics/monthlyFinanceChart";

export default function AnalyticsPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 pb-28 pt-5">
      <header className="flex items-end justify-between gap-3">
        <div className="rounded-full border border-app-border bg-app-surface px-3 py-1.5 text-[11px] font-bold text-app-text-2 shadow-sm">
          {new Date().toLocaleDateString("ar-EG", {
            month: "long",
            year: "numeric",
          })}
        </div>
      </header>

      <section>
        <MonthlyFinanceChart />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-app-text">التقويم</h2>
            <span className="text-[10px] font-bold text-app-text-2">
              كل يوم تفاصيله
            </span>
          </div>
          <MonthCalendar />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-app-text">مؤشرات اليوم</h2>
          </div>
          <TodayBento />
        </div>
      </section>
    </main>
  );
}
