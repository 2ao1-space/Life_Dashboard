import { db } from "@/lib/architecture/db";
import { CollectionRepository } from "@/lib/architecture/CollectionRepository";
import type { TransactionReasonEntity } from "@/types/finance";

export const transactionReasonsRepository =
  new CollectionRepository<TransactionReasonEntity>(
    db.transaction_reasons,
    "transaction_reasons",
  );
