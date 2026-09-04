import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import Providers from "./providers";
import OnboardingGate from "@/components/shared/onboardingGate";
import AppShell from "@/components/shared/appShell";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "حياتي",
  description: "تطبيق إدارة الحياة الشخصية",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={cairo.variable}
    >
      <body className="font-cairo">
        <Providers>
          <OnboardingGate>
            <AppShell>{children}</AppShell>
          </OnboardingGate>
        </Providers>
      </body>
    </html>
  );
}
