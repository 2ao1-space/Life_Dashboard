import { db } from "@/lib/architecture/db";
import { CollectionRepository } from "@/lib/architecture/CollectionRepository";
import type { AccountEntity } from "@/types/settings";

export const accountsRepository = new CollectionRepository<AccountEntity>(
  db.accounts,
  "accounts",
);
