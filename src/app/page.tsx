"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const { initialized, init } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (!initialized) return;
    router.replace("/dashboard");
  }, [initialized]);

  return (
    <div
      className="min-h-dvh flex items-center justify-center"
      style={{ background: "var(--bg-page)" }}
    >
      <Loader2
        size={24}
        className="animate-spin"
        style={{ color: "var(--accent)" }}
      />
    </div>
  );
}
