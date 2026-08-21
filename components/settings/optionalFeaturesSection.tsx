"use client";

import { useSettings } from "@/hooks/useSettings";
import Switch from "@/components/shared/Switch";
import type { SettingsEntity } from "@/types/settings";

type FeatureKey =
  | "nawafil_enabled"
  | "qiyam_enabled"
  | "debts_enabled"
  | "zakat_enabled";

const FEATURES: { key: FeatureKey; label: string }[] = [
  { key: "nawafil_enabled", label: "النوافل" },
  { key: "qiyam_enabled", label: "قيام الليل" },
  { key: "debts_enabled", label: "الديون والسلف" },
  { key: "zakat_enabled", label: "الزكاة" },
];

export default function OptionalFeaturesSection() {
  const { settings, update } = useSettings();

  if (!settings) return null;

  const handleToggle = (key: FeatureKey, value: boolean) => {
    update({ [key]: value } as Partial<SettingsEntity>);
  };

  return (
    <div className="rounded-card-lg border border-app-border bg-app-surface p-4 shadow-card">
      {FEATURES.map((feature) => (
        <div
          key={feature.key}
          className="flex items-center justify-between border-b border-app-border py-3 last:border-none"
        >
          <span className="text-[13.5px] font-semibold text-app-text">
            {feature.label}
          </span>
          <Switch
            checked={settings[feature.key]}
            onChange={(value) => handleToggle(feature.key, value)}
            label={feature.label}
          />
        </div>
      ))}
    </div>
  );
}
