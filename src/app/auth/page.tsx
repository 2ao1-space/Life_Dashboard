"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { initialized, init } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    init().then(() => {
      router.replace("/dashboard");
    });
  }, []);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-page)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <Loader2
          size={28}
          style={{ color: "var(--accent)", margin: "0 auto 12px" }}
          className="animate-spin"
        />
        <div style={{ color: "var(--text-3)", fontSize: 14 }}>
          جارٍ التحميل…
        </div>
      </div>
    </div>
  );
}
