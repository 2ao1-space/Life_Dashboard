import TodayBento from "@/components/analytics/todayBento";
import MonthCalendar from "@/components/analytics/monthCalendar";

export default function AnalyticsPage() {
  return (
    <main className="mx-auto max-w-md space-y-5 px-4 pb-28 pt-5">
      <h1 className="text-lg font-extrabold text-app-text">التحليلات</h1>

      <TodayBento />

      <section>
        <h2 className="mb-2 text-xs font-bold text-app-text-2">
          الكالندر{" "}
          <span className="font-normal">— اضغط على أي يوم لتقريره الكامل</span>
        </h2>
        <MonthCalendar />
      </section>
    </main>
  );
}
