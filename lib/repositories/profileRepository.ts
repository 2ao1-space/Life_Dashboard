import { db } from "@/lib/architecture/db";
import { SingleValueRepository } from "@/lib/architecture/SingleValueRepository";
import type { ProfileEntity } from "@/lib/types/settings";

export const profileRepository = new SingleValueRepository<ProfileEntity>(
  db.profile,
  "profile",
);
