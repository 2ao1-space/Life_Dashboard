"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";
import { useSettings } from "@/hooks/useSettings";
import type { ModuleKey } from "@/types/settings";

export default function SwipeNavigation({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { settings } = useSettings();
  const start = useRef<{ x: number; y: number; pointerId: number } | null>(
    null,
  );
  const modules: ModuleKey[] = settings?.visible_modules ?? [];
  const routes = ["/", ...modules.map((module) => `/${module}`), "/settings"];
  const index = routes.indexOf(pathname);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    if (
      (event.target as HTMLElement).closest(
        "button, a, input, textarea, select, [data-no-swipe]",
      )
    ) {
      return;
    }
    start.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!start.current || index < 0) return;
    if (event.pointerId !== start.current.pointerId) return;
    const deltaX = event.clientX - start.current.x;
    const deltaY = event.clientY - start.current.y;
    start.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (Math.abs(deltaX) < 70 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25)
      return;
    const nextIndex = deltaX < 0 ? index + 1 : index - 1;
    if (routes[nextIndex]) router.push(routes[nextIndex]);
  };

  const clearPointer = () => {
    start.current = null;
  };

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={clearPointer}
      className="touch-pan-y"
    >
      {children}
    </div>
  );
}
