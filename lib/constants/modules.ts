import type { ModuleKey } from "@/lib/types/settings";

export const MODULE_META: Record<ModuleKey, { label: string; icon: string }> = {
  finance: { label: "الماليات", icon: "💰" },
  prayer: { label: "الصلاة", icon: "🕌" },
  adhkar: { label: "الأذكار والقرآن", icon: "📿" },
  habits: { label: "العادات", icon: "✅" },
  notes: { label: "الملاحظات", icon: "📝" },
  documents: { label: "الوثائق", icon: "📁" },
  analytics: { label: "التحليلات", icon: "📊" },
};

export const ALL_MODULE_KEYS: ModuleKey[] = [
  "finance",
  "prayer",
  "adhkar",
  "habits",
  "notes",
  "documents",
  "analytics",
];
