"use client";

import { useState } from "react";
import ModuleGrid from "@/components/settings/moduleGrid";
import type { ModuleKey } from "@/types/settings";

interface ChooseModulesStepProps {
  initialSelected: ModuleKey[];
  onFinish: (selected: ModuleKey[]) => void;
  onBack: () => void;
}

export default function ChooseModulesStep({
  initialSelected,
  onFinish,
  onBack,
}: ChooseModulesStepProps) {
  const [selected, setSelected] = useState<ModuleKey[]>(initialSelected);

  const toggle = (key: ModuleKey) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  return (
    <main className="onboarding-shell flex min-h-screen flex-col justify-between px-5 pb-8 pt-7">
      <div>
        <div className="mb-10 flex items-center justify-between">
          <span className="text-xs font-bold text-app-primary">حياتي</span>
          <div
            className="flex items-center gap-2"
            aria-label="الخطوة الثانية من خطوتين"
          >
            <span className="h-1.5 w-10 rounded-full bg-app-primary" />
            <span className="h-1.5 w-10 rounded-full bg-app-primary" />
            <span className="mr-1 text-[11px] text-app-text-2">٢ / ٢</span>
          </div>
        </div>

        <div className="onboarding-reveal mb-7">
          <p className="mb-2 text-sm font-semibold text-app-primary">
            خطوة أخيرة
          </p>
          <h1 className="text-3xl font-extrabold leading-tight text-app-text">
            إيه اللي تحب تتابعه؟
          </h1>
          <p className="mt-3 text-sm leading-7 text-app-text-2">
            اختار اللي يناسب يومك. تقدر تغيّر اختيارك بعدين من الإعدادات.
          </p>
        </div>

        <div className="onboarding-reveal rounded-card-lg border border-app-border bg-app-surface p-3.5 shadow-card">
          <ModuleGrid selected={selected} onToggle={toggle} />
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-card-md border border-app-border bg-app-surface py-3.5 text-sm font-bold text-app-text-2 transition-colors hover:bg-app-surface-2"
        >
          رجوع
        </button>
        <button
          type="button"
          onClick={() => onFinish(selected)}
          className="flex-2 rounded-card-md bg-app-primary py-3.5 text-sm font-bold text-white shadow-card transition-transform active:scale-[.98]"
        >
          ابدأ استخدام التطبيق
        </button>
      </div>
    </main>
  );
}
