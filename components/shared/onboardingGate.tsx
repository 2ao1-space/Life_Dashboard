"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSettings } from "@/hooks/useSettings";

export default function OnboardingGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings } = useSettings();
  const pathname = usePathname();
  const router = useRouter();

  const needsOnboarding =
    settings && !settings.onboarding_completed && pathname !== "/onboarding";

  useEffect(() => {
    if (needsOnboarding) {
      router.replace("/onboarding");
    }
  }, [needsOnboarding, router]);

  if (needsOnboarding) return null;

  return <>{children}</>;
}
