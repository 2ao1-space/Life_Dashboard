import Dexie, { type Table } from "dexie";

export interface BaseEntity {
  id: string;
  user_id: string;
  updated_at: string;
  sync_status: "synced" | "pending" | "error";
  deleted?: boolean;
}

export class HayatiDB extends Dexie {
  profile!: Table<import("@/types/settings").ProfileEntity, string>;
  settings!: Table<import("@/types/settings").SettingsEntity, string>;
  accounts!: Table<import("@/types/settings").AccountEntity, string>;
  transactions!: Table<import("@/types/finance").TransactionEntity, string>;
  transaction_reasons!: Table<
    import("@/types/finance").TransactionReasonEntity,
    string
  >;
  debts!: Table<import("@/types/debtsZakat").DebtEntity, string>;
  zakat_payments!: Table<
    import("@/types/debtsZakat").ZakatPaymentEntity,
    string
  >;
  prayer_days!: Table<import("@/types/prayer").PrayerDayEntity, string>;
  dhikrs!: Table<import("@/types/adhkar").DhikrEntity, string>;
  duas!: Table<import("@/types/adhkar").DuaEntity, string>;
  quran_logs!: Table<import("@/types/adhkar").QuranLogEntity, string>;
  habits!: Table<import("@/types/habits").HabitEntity, string>;
  habit_logs!: Table<import("@/types/habits").HabitLogEntity, string>;
  tasks!: Table<import("@/types/habits").TaskEntity, string>;
  moods!: Table<import("@/types/habits").MoodEntity, string>;
  notes!: Table<import("@/types/notes").NoteEntity, string>;
  documents!: Table<import("@/types/documents").DocumentEntity, string>;

  constructor() {
    super("hayati-db");

    this.version(1).stores({
      _meta: "key",
    });

    this.version(2).stores({
      _meta: "key",
      profile: "id, user_id, sync_status",
      settings: "id, user_id, sync_status",
      accounts: "id, user_id, sync_status, order",
    });

    this.version(3).stores({
      _meta: "key",
      profile: "id, user_id, sync_status",
      settings: "id, user_id, sync_status",
      accounts: "id, user_id, sync_status, order",
      transactions: "id, user_id, sync_status, account_id, occurred_at",
      transaction_reasons: "id, user_id, sync_status, text",
    });

    this.version(4).stores({
      _meta: "key",
      profile: "id, user_id, sync_status",
      settings: "id, user_id, sync_status",
      accounts: "id, user_id, sync_status, order",
      transactions: "id, user_id, sync_status, account_id, occurred_at",
      transaction_reasons: "id, user_id, sync_status, text",
      debts: "id, user_id, sync_status, direction",
      zakat_payments: "id, user_id, sync_status, paid_at",
    });

    this.version(5).stores({
      _meta: "key",
      profile: "id, user_id, sync_status",
      settings: "id, user_id, sync_status",
      accounts: "id, user_id, sync_status, order",
      transactions: "id, user_id, sync_status, account_id, occurred_at",
      transaction_reasons: "id, user_id, sync_status, text",
      debts: "id, user_id, sync_status, direction",
      zakat_payments: "id, user_id, sync_status, paid_at",
      prayer_days: "id, user_id, sync_status, date",
    });

    this.version(6).stores({
      _meta: "key",
      profile: "id, user_id, sync_status",
      settings: "id, user_id, sync_status",
      accounts: "id, user_id, sync_status, order",
      transactions: "id, user_id, sync_status, account_id, occurred_at",
      transaction_reasons: "id, user_id, sync_status, text",
      debts: "id, user_id, sync_status, direction",
      zakat_payments: "id, user_id, sync_status, paid_at",
      prayer_days: "id, user_id, sync_status, date",
      dhikrs: "id, user_id, sync_status, category, order",
      duas: "id, user_id, sync_status, is_pinned",
      quran_logs: "id, user_id, sync_status, date",
    });

    this.version(7).stores({
      _meta: "key",
      profile: "id, user_id, sync_status",
      settings: "id, user_id, sync_status",
      accounts: "id, user_id, sync_status, order",
      transactions: "id, user_id, sync_status, account_id, occurred_at",
      transaction_reasons: "id, user_id, sync_status, text",
      debts: "id, user_id, sync_status, direction",
      zakat_payments: "id, user_id, sync_status, paid_at",
      prayer_days: "id, user_id, sync_status, date",
      dhikrs: "id, user_id, sync_status, category, order",
      duas: "id, user_id, sync_status, is_pinned",
      quran_logs: "id, user_id, sync_status, date",
      habits: "id, user_id, sync_status, order",
      habit_logs: "id, user_id, sync_status, habit_id, date",
      tasks: "id, user_id, sync_status, date, order",
      moods: "id, user_id, sync_status, date",
    });

    this.version(8).stores({
      _meta: "key",
      profile: "id, user_id, sync_status",
      settings: "id, user_id, sync_status",
      accounts: "id, user_id, sync_status, order",
      transactions: "id, user_id, sync_status, account_id, occurred_at",
      transaction_reasons: "id, user_id, sync_status, text",
      debts: "id, user_id, sync_status, direction",
      zakat_payments: "id, user_id, sync_status, paid_at",
      prayer_days: "id, user_id, sync_status, date",
      dhikrs: "id, user_id, sync_status, category, order",
      duas: "id, user_id, sync_status, is_pinned",
      quran_logs: "id, user_id, sync_status, date",
      habits: "id, user_id, sync_status, order",
      habit_logs: "id, user_id, sync_status, habit_id, date",
      tasks: "id, user_id, sync_status, date, order",
      moods: "id, user_id, sync_status, date",
      notes: "id, user_id, sync_status, type, is_pinned, order",
    });

    this.version(9).stores({
      _meta: "key",
      profile: "id, user_id, sync_status",
      settings: "id, user_id, sync_status",
      accounts: "id, user_id, sync_status, order",
      transactions: "id, user_id, sync_status, account_id, occurred_at",
      transaction_reasons: "id, user_id, sync_status, text",
      debts: "id, user_id, sync_status, direction",
      zakat_payments: "id, user_id, sync_status, paid_at",
      prayer_days: "id, user_id, sync_status, date",
      dhikrs: "id, user_id, sync_status, category, order",
      duas: "id, user_id, sync_status, is_pinned",
      quran_logs: "id, user_id, sync_status, date",
      habits: "id, user_id, sync_status, order",
      habit_logs: "id, user_id, sync_status, habit_id, date",
      tasks: "id, user_id, sync_status, date, order",
      moods: "id, user_id, sync_status, date",
      notes: "id, user_id, sync_status, type, is_pinned, order",
      documents: "id, user_id, sync_status",
    });
  }
}

export const db = new HayatiDB();
