"use client";

import { useSettings } from "@/hooks/useSettings";
import ModuleGrid from "./moduleGrid";
import ModuleOrderList from "./moduleOrderList";
import type { ModuleKey } from "@/lib/types/settings";

export default function ModulesSection() {
  const { settings, update } = useSettings();

  if (!settings) return null;

  const toggle = (key: ModuleKey) => {
    const isSelected = settings.visible_modules.includes(key);
    const next = isSelected
      ? settings.visible_modules.filter((k) => k !== key)
      : [...settings.visible_modules, key];
    update({ visible_modules: next });
  };

  return (
    <div className="space-y-3">
      <div className="rounded-card-lg border border-app-border bg-app-surface p-4 shadow-card">
        <ModuleGrid selected={settings.visible_modules} onToggle={toggle} />
        <p className="mt-3 text-[11.5px] text-app-text-2">
          الداشبورد والإعدادات ثابتين دايمًا. الباقي اختيارك بالكامل.
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold text-app-text-2">
          ترتيب الظهور في القائمة
        </p>
        <div className="rounded-card-lg border border-app-border bg-app-surface px-4 shadow-card">
          <ModuleOrderList
            order={settings.visible_modules}
            onReorder={(next) => update({ visible_modules: next })}
          />
        </div>
      </div>
    </div>
  );
}
