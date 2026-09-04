"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Home, Menu, Settings as SettingsIcon, X } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useProfile } from "@/hooks/useProfile";
import { MODULE_META } from "@/lib/constants/modules";
import AppIcon from "./AppIcon";
import ThemeToggle from "./Themetoggle";
import type { ModuleKey } from "@/types/settings";

export default function AppNav() {
  const { settings } = useSettings();
  const { profile } = useProfile();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(() => new Date());

  const visibleModules: ModuleKey[] = settings?.visible_modules ?? [];
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    const close = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("mousedown", close);
    };
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-app-border/80 bg-app-bg/90  backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-card-sm bg-app-primary text-white"
          >
            <Home size={18} />
          </Link>

          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-app-text">
              أهلًا{profile?.name ? ` يا ${profile.name}` : " بيك"}
            </p>
            <p className="truncate text-[11px] text-app-text-2">
              {now.toLocaleDateString("ar-EG", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
              <span className="mx-2 text-app-border">|</span>
              {now.toLocaleTimeString("ar-EG", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>
          {/* <span className="text-base font-extrabold text-app-text">حياتي</span> */}
        </div>
        <div ref={menuRef} className="relative flex items-center gap-2">
          <ThemeToggle compact />
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-label="فتح قائمة الصفحات"
            className="flex h-9 items-center gap-2 rounded-full bg-app-primary px-3 text-xs font-bold text-white"
          >
            {isMenuOpen ? <X size={17} /> : <Menu size={17} />}{" "}
          </button>
          {isMenuOpen && (
            <div className="absolute left-0 top-12 w-56 rounded-card-md border border-app-border bg-app-surface p-2 shadow-card">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 rounded-card-sm px-3 py-2.5 text-sm font-semibold ${isActive("/") ? "bg-app-primary-soft text-app-primary-soft-text" : "text-app-text-2"}`}
              >
                <Home size={17} /> الرئيسية
              </Link>
              {visibleModules.map((key) => {
                const meta = MODULE_META[key];
                return (
                  <Link
                    key={key}
                    href={`/${key}`}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-card-sm px-3 py-2.5 text-sm font-semibold ${isActive(`/${key}`) ? "bg-app-primary-soft text-app-primary-soft-text" : "text-app-text-2"}`}
                  >
                    <AppIcon name={meta.icon} size={18} />
                    {meta.label}
                  </Link>
                );
              })}
              <Link
                href="/settings"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 rounded-card-sm px-3 py-2.5 text-sm font-semibold ${isActive("/settings") ? "bg-app-primary-soft text-app-primary-soft-text" : "text-app-text-2"}`}
              >
                <SettingsIcon size={18} />
                الإعدادات
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
