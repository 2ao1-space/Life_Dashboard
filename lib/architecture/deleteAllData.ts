import { db } from "./db";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUserId } from "@/lib/supabase/auth";

const CLOUD_TABLES = [
  "profiles",
  "user_locations",
  "accounts",
  "navbar_preferences",
  "module_preferences",
];

export async function deleteAllUserData(): Promise<void> {
  const userId = await getCurrentUserId();

  await db.transaction(
    "rw",
    db.profile,
    db.location,
    db.accounts,
    db.navbarPreference,
    db.modulePreference,
    async () => {
      await Promise.all([
        db.profile.clear(),
        db.location.clear(),
        db.accounts.clear(),
        db.navbarPreference.clear(),
        db.modulePreference.clear(),
      ]);
    },
  );

  for (const table of CLOUD_TABLES) {
    const { error } = await supabase.from(table).delete().eq("user_id", userId);
    if (error) throw error;
  }
}
