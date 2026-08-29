import { db } from "@/lib/architecture/db";
import { CollectionRepository } from "@/lib/architecture/CollectionRepository";
import { DebtCloudAdapter } from "@/lib/architecture/DebtCloudAdapter";
import type { DebtEntity } from "@/types/debtsZakat";

export const debtsRepository = new CollectionRepository<DebtEntity>(
  db.debts,
  "debts",
  new DebtCloudAdapter(),
);
