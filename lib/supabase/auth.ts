import { supabase } from "./client";

let authReadyPromise: Promise<string> | null = null;

function initAuth(): Promise<string> {
  if (authReadyPromise) return authReadyPromise;

  authReadyPromise = new Promise((resolve, reject) => {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event !== "INITIAL_SESSION") return;

        if (session?.user) {
          resolve(session.user.id);
        } else {
          const { data, error } = await supabase.auth.signInAnonymously();
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
  const { error } = await supabase.auth.linkIdentity({
    provider: "google",
  });
  if (error) throw error;
}
