"use client";

import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useUserId } from "@/lib/context/UserContext";
import { profileRepository } from "@/lib/repositories/profileRepository";
import type { ProfileEntity } from "@/types/settings";

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
  const { userId } = useUserId();

  useEffect(() => {
    if (!userId) return;
    profileRepository.get(userId).then((existing) => {
      if (!existing) profileRepository.save(userId, EMPTY_PROFILE);
    });
  }, [userId]);

  const profile = useLiveQuery(async () => {
    if (!userId) return undefined;
    return profileRepository.get(userId);
  }, [userId]);

  const update = (changes: Partial<ProfileInput>) => {
    if (!userId || !profile) return;
    profileRepository.save(userId, { ...profile, ...changes });
  };

  return { profile, update, isLoading: profile === undefined };
}
