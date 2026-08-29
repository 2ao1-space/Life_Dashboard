"use client";

import { useState } from "react";
import TasksSection from "@/components/habits/tasksSection";
import HabitsGrid from "@/components/habits/habitsGrid";
import ManageHabitsModal from "@/components/habits/manageHabitsModal";

export default function HabitsPage() {
  const [isManageOpen, setIsManageOpen] = useState(false);

  return (
    <main className="mx-auto max-w-md space-y-5 px-4 pb-28 pt-5">
      <h1 className="text-lg font-extrabold text-app-text">العادات</h1>

      <section>
        <h2 className="mb-2 text-xs font-bold text-app-text-2">مهام اليوم</h2>
        <TasksSection />
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-bold text-app-text-2">
            جدول العادات — الشهر ده
          </h2>
          <button
            type="button"
            onClick={() => setIsManageOpen(true)}
            className="text-xs font-bold text-app-primary"
          >
            ✎ تعديل العادات
          </button>
        </div>
        <HabitsGrid />
      </section>

      <ManageHabitsModal
        isOpen={isManageOpen}
        onClose={() => setIsManageOpen(false)}
      />
    </main>
  );
}
