import { db } from "@/lib/architecture/db";
import { CollectionRepository } from "@/lib/architecture/CollectionRepository";
import { ZakatCloudAdapter } from "@/lib/architecture/ZakatCloudAdapter";

import type { ZakatPaymentEntity } from "@/types/debtsZakat";

export const zakatPaymentsRepository =
  new CollectionRepository<ZakatPaymentEntity>(
    db.zakat_payments,
    "zakat_payments",
    new ZakatCloudAdapter(),
  );
