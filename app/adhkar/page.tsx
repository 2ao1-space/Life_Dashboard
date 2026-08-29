"use client";

import { useState } from "react";
import DhikrList from "@/components/adhkar/dhikrList";
import DuasSection from "@/components/adhkar/duasSection";
import QuranTracker from "@/components/adhkar/quranTracker";
import type { DhikrCategory } from "@/types/adhkar";

export default function AdhkarPage() {
  const [tab, setTab] = useState<DhikrCategory>("morning");

  return (
    <main className="mx-auto max-w-md space-y-5 px-4 pb-28 pt-5">
      <h1 className="text-lg font-extrabold text-app-text">الأذكار والقرآن</h1>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("morning")}
          className={`flex-1 rounded-card-sm py-2 text-xs font-bold ${
            tab === "morning"
              ? "bg-app-primary text-white"
              : "bg-app-surface-2 text-app-text-2"
          }`}
        >
          أذكار الصباح
        </button>
        <button
          type="button"
          onClick={() => setTab("evening")}
          className={`flex-1 rounded-card-sm py-2 text-xs font-bold ${
            tab === "evening"
              ? "bg-app-primary text-white"
              : "bg-app-surface-2 text-app-text-2"
          }`}
        >
          أذكار المساء
        </button>
      </div>

      <DhikrList category={tab} />

      <section>
        <h2 className="mb-2 text-xs font-bold text-app-text-2">
          الأدعية الشخصية
        </h2>
        <DuasSection />
      </section>

      <section>
        <h2 className="mb-2 text-xs font-bold text-app-text-2">القرآن</h2>
        <QuranTracker />
      </section>
    </main>
  );
}
