import { db } from "@/lib/architecture/db";
import { CollectionRepository } from "@/lib/architecture/CollectionRepository";
import { TransactionCloudAdapter } from "@/lib/architecture/transactionCloudAdapter";
import type { TransactionEntity } from "@/types/finance";

export const transactionsRepository =
  new CollectionRepository<TransactionEntity>(
    db.transactions,
    "transactions",
    new TransactionCloudAdapter(),
  );
