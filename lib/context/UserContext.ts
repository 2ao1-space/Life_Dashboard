"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { getCurrentUserId } from "@/lib/supabase/auth";

interface UserContextValue {
  userId: string | null;
  isReady: boolean;
}

const UserContext = createContext<UserContextValue>({
  userId: null,
  isReady: false,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCurrentUserId().then((id) => {
      if (cancelled) return;
      setUserId(id);
      setIsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return createElement(
    UserContext.Provider,
    { value: { userId, isReady } },
    children,
  );
}

export function useUserId() {
  return useContext(UserContext);
}
