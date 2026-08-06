export type WalletId = string;

export interface Wallet {
  id: WalletId;
  name: string;
  icon: string;
  color: string;
  balance?: number;
  synced?: boolean;
}

export const DEFAULT_WALLETS: Wallet[] = [
  { id: "cash", name: "كاش", icon: "💵", color: "var(--accent-green)" },
  { id: "card", name: "بطاقة", icon: "💳", color: "var(--accent)" },
];

export type TransactionType = "income" | "expense" | "charity" | "salary";

export interface Transaction {
  id?: number;
  amount: number;
  type: TransactionType;
  walletId: WalletId;
  note?: string;
  timestamp: Date;
  date: string;
  synced?: boolean;
  userId?: string;
}

export function isIncomeType(type: TransactionType): boolean {
  return type === "income" || type === "salary";
}
export function isIncomeTx(t: Transaction): boolean {
  return isIncomeType(t.type);
}

export interface Prayer {
  id?: number;
  date: string;
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  synced?: boolean;
  userId?: string;
}
export type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
export const PRAYER_NAMES: PrayerName[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];
export const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: "الفجر",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};
export const PRAYER_ICONS: Record<PrayerName, string> = {
  fajr: "🌙",
  dhuhr: "☀️",
  asr: "🌤",
  maghrib: "🌅",
  isha: "🌃",
};

export interface Note {
  id?: number;
  content: string;
  date?: string;
  isPinned: boolean;
  order: number;
  createdAt: Date;
  synced?: boolean;
  userId?: string;
}

export type DebtDirection = "i_owe" | "they_owe";

export interface Debt {
  id?: number;
  direction: DebtDirection;
  person: string;
  amount: number;
  note?: string;
  dueDate?: string;
  isSettled: boolean;
  createdAt: Date;
  synced?: boolean;
  userId?: string;
}

export interface CharityPayment {
  id?: number;
  userId?: string;
  amount: number;
  recipient: string;
  note?: string;
  photoDataUrl?: string;
  date: string;
  monthKey: string;
  timestamp: Date;
  synced?: boolean;
}

export interface CharityMonth {
  id?: number;
  userId?: string;
  monthKey: string;
  salaryTotal: number;
  required: number;
  carriedOver: number;
  totalRequired: number;
  paidAmount: number;
  remaining: number;
  isClosed: boolean;
  synced?: boolean;
}

export interface ZakatPayment {
  id?: number;
  amount: number;
  recipient: string;
  note?: string;
  photoDataUrl?: string;
  date: string;
  monthKey: string;
  timestamp: Date;
  synced?: boolean;
  userId?: string;
}

export interface ZakatMonth {
  id?: number;
  monthKey: string;
  salaryAmount: number;
  baseRequired: number;
  carriedOver: number;
  totalRequired: number;
  paidAmount: number;
  remaining: number;
  isClosed: boolean;
  synced?: boolean;
  userId?: string;
}

export interface User {
  id: string;
  email?: string;
  name?: string;
  createdAt: Date;
}

export interface MonthlyReport {
  monthKey: string;
  salary: number;
  totalIncome: number;
  totalExpenses: number;
  totalCharity: number;
  netBalance: number;
  prevCarriedBalance: number;
  closingBalance: number;
  zakatRequired: number;
  zakatPaid: number;
  zakatRemaining: number;
  zakatClosed: boolean;
  prayerDays: number;
  totalDays: number;
  prayerPct: number;
  walletBalances: Record<WalletId, number>;
}

export interface SyncQueueItem {
  id?: number;
  tableName: string;
  operation: "upsert" | "delete";
  localId: number;
  payload: string;
  createdAt: Date;
  userId?: string;
}
