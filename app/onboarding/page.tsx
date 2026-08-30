"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/hooks/useSettings";
import WelcomeStep from "@/components/onboarding/welcomeStep";
import ChooseModulesStep from "@/components/onboarding/choosemodulesStep";
import { DEFAULT_SETTINGS, type ModuleKey } from "@/types/settings";

export default function OnboardingPage() {
  const { settings, update } = useSettings();
  const router = useRouter();
  const [step, setStep] = useState<"welcome" | "choose">("welcome");

  const handleFinish = (selected: ModuleKey[]) => {
    update({ visible_modules: selected, onboarding_completed: true });
    router.replace("/");
  };

  if (step === "welcome") {
    return <WelcomeStep onNext={() => setStep("choose")} />;
  }

  return (
    <ChooseModulesStep
      initialSelected={
        settings?.visible_modules ?? DEFAULT_SETTINGS.visible_modules
      }
      onFinish={handleFinish}
      onBack={() => setStep("welcome")}
    />
  );
}
