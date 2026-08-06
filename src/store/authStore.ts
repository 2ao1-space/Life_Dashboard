"use client";
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/deviceId";
import { clearAllData } from "@/lib/db";
import type { User } from "@/types";

function translateError(msg: string): string {
  if (msg.includes("Invalid login credentials"))
    return "البريد أو كلمة المرور غير صحيحة";
  if (msg.includes("Email not confirmed")) return "تحقق من بريدك لتأكيد الحساب";
  if (msg.includes("User already registered"))
    return "هذا البريد مسجل — حاول تسجيل الدخول";
  if (msg.includes("Password should be at least"))
    return "كلمة المرور 6 أحرف على الأقل";
  if (
    msg.includes("rate limit") ||
    msg.includes("429") ||
    msg.includes("security purposes")
  )
    return "انتظر دقيقة ثم حاول مرة أخرى";
  return msg;
}

function sessionToUser(session: any): User {
  return {
    id: session.user.id,
    email: session.user.email!,
    name:
      session.user.user_metadata?.name || session.user.user_metadata?.full_name,
    createdAt: new Date(session.user.created_at),
  };
}

function makeOfflineUser(): User {
  return { id: getDeviceId(), createdAt: new Date() };
}

interface AuthState {
  user: User | null;
  isOffline: boolean;
  loading: boolean;
  error: string | null;
  info: string | null;
  initialized: boolean;
  init: () => Promise<void>;
  linkWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearAllUserData: () => Promise<void>;
  clearMessages: () => void;
}

let _listenerSetup = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isOffline: true,
  loading: false,
  error: null,
  info: null,
  initialized: false,

  init: async () => {
    if (get().initialized) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        set({
          user: sessionToUser(session),
          isOffline: false,
          initialized: true,
        });
      } else {
        set({ user: makeOfflineUser(), isOffline: true, initialized: true });
      }
    } catch {
      set({ user: makeOfflineUser(), isOffline: true, initialized: true });
    }

    if (!_listenerSetup) {
      _listenerSetup = true;
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          set({
            user: sessionToUser(session),
            isOffline: false,
            error: null,
            info: null,
          });
        }
      });
    }
  },

  linkWithGoogle: async () => {
    set({ loading: true, error: null, info: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/dashboard`
              : "/dashboard",
        },
      });
      if (error) set({ error: translateError(error.message), loading: false });
    } catch {
      set({ error: "خطأ في الاتصال بـ Google", loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    set({
      user: makeOfflineUser(),
      isOffline: true,
      loading: false,
      error: null,
      info: null,
    });
  },

  clearAllUserData: async () => {
    set({ loading: true });
    try {
      await clearAllData();
      await supabase.auth.signOut().catch(() => {});
    } catch {
      /* ignore */
    }
    set({
      user: makeOfflineUser(),
      isOffline: true,
      loading: false,
      error: null,
      info: null,
    });
  },

  clearMessages: () => set({ error: null, info: null }),
}));
