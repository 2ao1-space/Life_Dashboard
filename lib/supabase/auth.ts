import { isSupabaseConfigured, supabase } from "./client";

let authReadyPromise: Promise<string> | null = null;

function initAuth(): Promise<string> {
  if (!isSupabaseConfigured || !supabase) {
    return Promise.reject(
      new Error(
        "لم يتم تكوين Supabase. أضف NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      ),
    );
  }

  const client = supabase;

  if (authReadyPromise) return authReadyPromise;

  authReadyPromise = new Promise((resolve, reject) => {
    const { data: subscription } = client.auth.onAuthStateChange(
      async (event, session) => {
        if (event !== "INITIAL_SESSION") return;

        if (session?.user) {
          resolve(session.user.id);
        } else {
          const { data, error } = await client.auth.signInAnonymously();
          if (error || !data.user) {
            reject(error ?? new Error("فشل إنشاء حساب أنونيميوس"));
            return;
          }
          resolve(data.user.id);
        }

        subscription.subscription.unsubscribe();
      },
    );
  });

  return authReadyPromise;
}

export async function getCurrentUserId(): Promise<string> {
  return initAuth();
}

export async function linkGoogleAccount() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      "Supabase غير مكوّن. أضف NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY أولًا.",
    );
  }

  const client = supabase;
  const { error } = await client.auth.linkIdentity({
    provider: "google",
  });
  if (error) throw error;
}

export async function checkGoogleLinked(): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  const client = supabase;
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return false;
  return Boolean(
    data.user.identities?.some((identity) => identity.provider === "google"),
  );
}
