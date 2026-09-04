"use client";

import { useEffect, useState } from "react";
import { checkGoogleLinked, linkGoogleAccount } from "@/lib/supabase/auth";

export default function GoogleSyncSection() {
  const [isLinked, setIsLinked] = useState<boolean | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkGoogleLinked().then(setIsLinked);
  }, []);

  const handleLink = async () => {
    setIsLinking(true);
    setError(null);
    try {
      await linkGoogleAccount();
    } catch {
      setError("حصلت مشكلة في الربط، جرّب تاني");
      setIsLinking(false);
    }
  };

  return (
    <div className="rounded-card-lg border border-app-border bg-app-surface p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-bold text-app-text">
            مزامنة جوجل
          </div>
          <p className="mt-0.5 text-xs text-app-text-2">
            {isLinked === null
              ? "بنتأكد من الحالة..."
              : isLinked
                ? "بياناتك متزامنة، تقدر تفتح التطبيق من أي جهاز بنفس الحساب"
                : "اربط حسابك عشان بياناتك تتحفظ لو غيّرت الجهاز"}
          </p>
        </div>
        {isLinked ? (
          <span className="shrink-0 rounded-full bg-app-primary-soft px-3 py-1 text-[11px] font-bold text-app-primary-soft-text">
            متزامن ✓
          </span>
        ) : (
          <button
            type="button"
            onClick={handleLink}
            disabled={isLinking || isLinked === null}
            className="shrink-0 rounded-full bg-app-primary px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
          >
            {isLinking ? "جاري الربط..." : "ربط بجوجل"}
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-app-danger">{error}</p>}
    </div>
  );
}
