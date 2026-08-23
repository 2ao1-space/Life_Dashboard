"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, Settings as SettingsIcon, MoreHorizontal } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { MODULE_META } from "@/lib/constants/modules";
import Modal from "./Modal";
import type { ModuleKey } from "@/types/settings";

const MAX_PRIMARY_MODULES = 3;

export default function AppNav() {
  const { settings } = useSettings();
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const visibleModules: ModuleKey[] = settings?.visible_modules ?? [];
  const primaryModules = visibleModules.slice(0, MAX_PRIMARY_MODULES);
  const overflowModules = visibleModules.slice(MAX_PRIMARY_MODULES);
  const hasOverflow = overflowModules.length > 0;

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-app-border bg-app-surface px-1.5 pb-3.5 pt-2.5 lg:hidden">
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 px-2.5 text-[10.5px] font-semibold ${
            isActive("/") ? "text-app-primary" : "text-app-text-2"
          }`}
        >
          <Home size={19} />
          الرئيسية
        </Link>

        {primaryModules.map((key) => {
          const meta = MODULE_META[key];
          const href = `/${key}`;
          return (
            <Link
              key={key}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-2.5 text-[10.5px] font-semibold ${
                isActive(href) ? "text-app-primary" : "text-app-text-2"
              }`}
            >
              <span className="text-[19px] leading-none">{meta.icon}</span>
              {meta.label}
            </Link>
          );
        })}

        {hasOverflow ? (
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-col items-center gap-0.5 px-2.5 text-[10.5px] font-semibold text-app-text-2"
          >
            <MoreHorizontal size={19} />
            المزيد
          </button>
        ) : (
          <Link
            href="/settings"
            className={`flex flex-col items-center gap-0.5 px-2.5 text-[10.5px] font-semibold ${
              isActive("/settings") ? "text-app-primary" : "text-app-text-2"
            }`}
          >
            <SettingsIcon size={19} />
            الإعدادات
          </Link>
        )}
      </nav>

      <nav className="fixed inset-y-0 right-0 z-30 hidden w-56 flex-col gap-1 border-l border-app-border bg-app-surface p-4 lg:flex">
        <div className="mb-4 px-2 text-base font-extrabold text-app-text">
          حياتي
        </div>

        <Link
          href="/"
          className={`flex items-center gap-3 rounded-card-sm px-3 py-2.5 text-[13.5px] font-semibold ${
            isActive("/")
              ? "bg-app-primary-soft text-app-primary-soft-text"
              : "text-app-text-2"
          }`}
        >
          <Home size={17} /> الرئيسية
        </Link>

        {visibleModules.map((key) => {
          const meta = MODULE_META[key];
          const href = `/${key}`;
          return (
            <Link
              key={key}
              href={href}
              className={`flex items-center gap-3 rounded-card-sm px-3 py-2.5 text-[13.5px] font-semibold ${
                isActive(href)
                  ? "bg-app-primary-soft text-app-primary-soft-text"
                  : "text-app-text-2"
              }`}
            >
              <span className="text-base">{meta.icon}</span> {meta.label}
            </Link>
          );
        })}

        <Link
          href="/settings"
          className={`mt-auto flex items-center gap-3 rounded-card-sm px-3 py-2.5 text-[13.5px] font-semibold ${
            isActive("/settings")
              ? "bg-app-primary-soft text-app-primary-soft-text"
              : "text-app-text-2"
          }`}
        >
          <SettingsIcon size={17} /> الإعدادات
        </Link>
      </nav>

      <Modal
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        title="باقي الصفحات"
        size="sm"
      >
        <div className="space-y-1">
          {overflowModules.map((key) => {
            const meta = MODULE_META[key];
            return (
              <Link
                key={key}
                href={`/${key}`}
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center gap-3 rounded-card-md px-3 py-3 text-sm font-semibold text-app-text hover:bg-app-surface-2"
              >
                <span className="text-lg">{meta.icon}</span>
                {meta.label}
              </Link>
            );
          })}
          <Link
            href="/settings"
            onClick={() => setIsMoreOpen(false)}
            className="flex items-center gap-3 rounded-card-md px-3 py-3 text-sm font-semibold text-app-text hover:bg-app-surface-2"
          >
            <SettingsIcon size={18} />
            الإعدادات
          </Link>
        </div>
      </Modal>
    </>
  );
}
