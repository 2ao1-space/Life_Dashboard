"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import { getCurrentUserId } from "@/lib/supabase/auth";
import { profileRepository } from "@/lib/repositories/profileRepository";

import type { ProfileEntity } from "@/lib/types/settings";

type ProfileInput = Omit<
  ProfileEntity,
  "id" | "user_id" | "updated_at" | "sync_status" | "deleted"
>;

const EMPTY_PROFILE: ProfileInput = {
  name: null,
  birth_date: null,
  location_city: null,
  location_lat: null,
  location_lng: null,
  google_linked: false,
};

export function useProfile() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUserId().then(setUserId);
  }, []);

  const profile = useLiveQuery(async () => {
    if (!userId) return undefined;

    return profileRepository.get(userId);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const initializeProfile = async () => {
      const existing = await profileRepository.get(userId);

      if (!existing) {
        await profileRepository.save(userId, EMPTY_PROFILE);
      }
    };

    initializeProfile();
  }, [userId]);

  const update = async (changes: Partial<ProfileInput>) => {
    if (!userId || !profile) return;

    await profileRepository.save(userId, {
      ...profile,
      ...changes,
    });
  };

  return {
    profile,
    update,
    isLoading: profile === undefined,
  };
}

// "use client";

// import { useEffect, useState } from "react";
// import { useLiveQuery } from "dexie-react-hooks";
// import { getCurrentUserId } from "@/lib/supabase/auth";
// import { profileRepository } from "@/lib/repositories/profileRepository";
// import type { ProfileEntity } from "@/types/settings";

// type ProfileInput = Omit<
//   ProfileEntity,
//   "id" | "user_id" | "updated_at" | "sync_status" | "deleted"
// >;

// const EMPTY_PROFILE: ProfileInput = {
//   name: null,
//   birth_date: null,
//   location_city: null,
//   location_lat: null,
//   location_lng: null,
//   google_linked: false,
// };

// export function useProfile() {
//   const [userId, setUserId] = useState<string | null>(null);

//   useEffect(() => {
//     getCurrentUserId().then(setUserId);
//   }, []);

//   const profile = useLiveQuery(async () => {
//     if (!userId) return undefined;
//     const existing = await profileRepository.get(userId);
//     if (existing) return existing;
//     return profileRepository.save(userId, EMPTY_PROFILE);
//   }, [userId]);

//   const update = (changes: Partial<ProfileInput>) => {
//     if (!userId || !profile) return;
//     profileRepository.save(userId, { ...profile, ...changes });
//   };

//   return { profile, update, isLoading: profile === undefined };
// }
