import { isSupabaseConfigured, supabase } from "./client";

let authReadyPromise: Promise<string> | null = null;

function getClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      "لم يتم تكوين Supabase. أضف NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return supabase;
}

function initAuth(): Promise<string> {
  const client = getClient();

  if (authReadyPromise) return authReadyPromise;

  authReadyPromise = (async () => {
    const {
      data: { session },
      error: sessionError,
    } = await client.auth.getSession();
    if (sessionError) throw sessionError;
    if (session?.user) return session.user.id;

    const { data, error } = await client.auth.signInAnonymously();
    if (error || !data.user) {
      throw error ?? new Error("فشل إنشاء حساب أنونيميوس");
    }

    return data.user.id;
  })();

  return authReadyPromise;
}

export async function getCurrentUserId(): Promise<string> {
  return initAuth();
}

export async function signInWithGoogle() {
  const client = getClient();
  const redirectTo =
    typeof window !== "undefined" ? window.location.origin : undefined;

  const { error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  if (error) throw error;
}

export async function linkGoogleAccount() {
  const client = getClient();

  const {
    data: { session },
  } = await client.auth.getSession();

  if (!session) {
    await signInWithGoogle();
    return;
  }

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
