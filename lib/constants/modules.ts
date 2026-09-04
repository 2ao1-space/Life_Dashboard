import type { ModuleKey } from "@/types/settings";

export const MODULE_META: Record<ModuleKey, { label: string; icon: string }> = {
  finance: { label: "الماليات", icon: "finance" },
  prayer: { label: "الصلاة", icon: "prayer" },
  adhkar: { label: "الأذكار والقرآن", icon: "adhkar" },
  habits: { label: "العادات", icon: "habits" },
  notes: { label: "الملاحظات", icon: "notes" },
  documents: { label: "الوثائق", icon: "documents" },
  analytics: { label: "التحليلات", icon: "analytics" },
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
