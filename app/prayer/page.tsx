"use client";

import { useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import PrayerCircles from "@/components/prayer/prayerCircles";
import NawafilSection from "@/components/prayer/nawafilSection";
import QiyamSection from "@/components/prayer/qiyamSection";
import CalendarStrip from "@/components/prayer/calendarStrip";

export default function PrayerPage() {
  const { settings } = useSettings();
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <main className="mx-auto max-w-2xl space-y-5 px-4 pb-28 pt-5">
      <section>
        <h2 className="mb-2 text-xs font-bold text-app-text-2">الكالندر</h2>
        <CalendarStrip selectedDate={selectedDate} onSelect={setSelectedDate} />
      </section>

      <div className="rounded-card-lg border border-app-border bg-app-surface p-4 shadow-card">
        <PrayerCircles date={selectedDate} />
      </div>

      {settings?.nawafil_enabled && (
        <section>
          <h2 className="mb-2 text-xs font-bold text-app-text-2">النوافل</h2>
          <NawafilSection date={selectedDate} />
        </section>
      )}

      {settings?.qiyam_enabled && (
        <section>
          <h2 className="mb-2 text-xs font-bold text-app-text-2">قيام الليل</h2>
          <QiyamSection date={selectedDate} />
        </section>
      )}
    </main>
  );
}
