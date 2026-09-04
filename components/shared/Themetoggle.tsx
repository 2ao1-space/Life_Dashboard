"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  // This is required to avoid a hydration flash while the theme resolves on the client.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={compact ? "h-9 w-9 rounded-full" : "h-9 w-24 rounded-full"}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
      title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
      className={`flex items-center justify-center rounded-full border border-app-border bg-app-surface text-app-text shadow-card ${compact ? "h-9 w-9" : "gap-2 px-3.5 py-1.5 text-sm font-semibold"}`}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      {!compact && <span>{isDark ? "لايت مود" : "دارك مود"}</span>}
    </button>
  );
}
