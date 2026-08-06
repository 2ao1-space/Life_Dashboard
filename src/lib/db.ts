import Dexie, { Table } from "dexie";
import type {
  Transaction,
  Prayer,
  Note,
  ZakatPayment,
  ZakatMonth,
  CharityMonth,
  CharityPayment,
  Debt,
  SyncQueueItem,
} from "@/types";

class LifeDashboardDB extends Dexie {
  transactions!: Table<Transaction>;
  prayers!: Table<Prayer>;
  notes!: Table<Note>;
  zakatPayments!: Table<ZakatPayment>;
  zakatMonths!: Table<ZakatMonth>;
  charityMonths!: Table<CharityMonth>;
  charityPayments!: Table<CharityPayment>;
  debts!: Table<Debt>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super("LifeDashboard");

    this.version(1).stores({
      transactions: "++id,date,type",
      prayers: "++id,&date",
      notes: "++id,date,isPinned,createdAt",
    });
    this.version(2).stores({
      transactions: "++id,date,type",
      prayers: "++id,&date",
      notes: "++id,date,isPinned,order,createdAt",
      zakatPayments: "++id,date,timestamp",
    });
    this.version(3).stores({
      transactions: "++id,date,type,synced",
      prayers: "++id,&date,synced",
      notes: "++id,date,isPinned,order,createdAt,synced",
      zakatPayments: "++id,date,timestamp,synced",
      syncQueue: "++id,tableName,createdAt",
    });
    this.version(4).stores({
      transactions: "++id,date,type,synced",
      prayers: "++id,&date,synced",
      notes: "++id,date,isPinned,order,createdAt,synced",
      zakatPayments: "++id,date,monthKey,timestamp,synced",
      zakatMonths: "++id,&monthKey,synced",
      syncQueue: "++id,tableName,createdAt",
    });
    this.version(5)
      .stores({
        transactions: "++id,date,type,synced",
        prayers: "++id,&date,synced",
        notes: "++id,date,isPinned,order,createdAt,synced",
        zakatPayments: "++id,date,monthKey,timestamp,synced",
        zakatMonths: "++id,&monthKey,synced",
        syncQueue: "++id,tableName,createdAt",
      })
      .upgrade((tx) =>
        tx
          .table("zakatMonths")
          .toCollection()
          .modify((row: any) => {
            if ("netBalance" in row && !("salaryAmount" in row)) {
              row.salaryAmount = row.netBalance;
              delete row.netBalance;
            }
          }),
      );
    this.version(6).stores({
      transactions: "++id,date,type,synced,userId",
      prayers: "++id,[userId+date],userId,date,synced",
      notes: "++id,userId,date,isPinned,order,createdAt,synced",
      zakatPayments: "++id,userId,date,monthKey,timestamp,synced",
      zakatMonths: "++id,[userId+monthKey],userId,monthKey,synced",
      syncQueue: "++id,userId,tableName,createdAt",
    });
    this.version(7)
      .stores({
        transactions: "++id,date,type,walletId,synced,userId",
        prayers: "++id,[userId+date],userId,date,synced",
        notes: "++id,userId,date,isPinned,order,createdAt,synced",
        zakatPayments: "++id,userId,date,monthKey,timestamp,synced",
        zakatMonths: "++id,[userId+monthKey],userId,monthKey,synced",
        syncQueue: "++id,userId,tableName,createdAt",
      })
      .upgrade((tx) =>
        tx
          .table("transactions")
          .toCollection()
          .modify((row: any) => {
            if (!row.walletId) row.walletId = "cash";
          }),
      );
    this.version(8).stores({
      transactions: "++id,date,type,walletId,synced,userId",
      prayers: "++id,[userId+date],userId,date,synced",
      notes: "++id,userId,date,isPinned,order,createdAt,synced",
      zakatPayments: "++id,userId,date,monthKey,timestamp,synced",
      zakatMonths: "++id,[userId+monthKey],userId,monthKey,synced",
      syncQueue: "++id,userId,tableName,createdAt",
    });

    this.version(9).stores({
      transactions: "++id,date,type,walletId,synced,userId",
      prayers: "++id,[userId+date],userId,date,synced",
      notes: "++id,userId,date,isPinned,order,createdAt,synced",
      zakatPayments: "++id,userId,date,monthKey,timestamp,synced",
      zakatMonths: "++id,[userId+monthKey],userId,monthKey,synced",
      charityMonths: "++id,[userId+monthKey],userId,monthKey,synced",
      charityPayments: "++id,userId,monthKey,date,timestamp,synced",
      debts: "++id,userId,direction,isSettled,createdAt,synced",
      syncQueue: "++id,userId,tableName,createdAt",
    });
  }
}

let _db: LifeDashboardDB | null = null;

export function getDB(): LifeDashboardDB {
  if (typeof window === "undefined")
    throw new Error("IndexedDB is browser-only");
  if (!_db) _db = new LifeDashboardDB();
  return _db;
}

export async function clearAllData(): Promise<void> {
  const db = getDB();
  await Promise.all([
    db.transactions.clear(),
    db.prayers.clear(),
    db.notes.clear(),
    db.zakatPayments.clear(),
    db.zakatMonths.clear(),
    db.charityMonths.clear(),
    db.charityPayments.clear(),
    db.debts.clear(),
    db.syncQueue.clear(),
  ]);
  if (typeof window !== "undefined") {
    localStorage.removeItem("_life_user");
    localStorage.removeItem("_wallets");
    localStorage.removeItem("_pending_signup");
  }
}

export async function nukeAllData(): Promise<void> {
  await clearAllData();
  if (typeof window !== "undefined") localStorage.clear();
  _db?.close();
  _db = null;
  await Dexie.delete("LifeDashboard");
}
