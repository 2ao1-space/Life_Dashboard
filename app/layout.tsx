import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import Providers from "./providers";
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
