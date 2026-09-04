"use client";

import { usePathname } from "next/navigation";
import AppNav from "@/components/shared/Navbar";
import SwipeNavigation from "@/components/shared/SwipeNavigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/onboarding") {
    return <>{children}</>;
  }

  return (
    <>
      <AppNav />
      <SwipeNavigation>
        <div className="pt-16">{children}</div>
      </SwipeNavigation>
    </>
  );
}
