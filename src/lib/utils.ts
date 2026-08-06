import { format, differenceInCalendarDays, parseISO } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import type { TransactionType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function today(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatDate(date: string): string {
  try {
    return format(parseISO(date), "d MMM yyyy");
  } catch {
    return date;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), "h:mm a");
}

export function isTxEditable(date: string): boolean {
  return differenceInCalendarDays(new Date(), parseISO(date)) <= 2;
}

export function isIncomeType(type: TransactionType): boolean {
  return type === "income" || type === "salary";
}

export function calculateZakat(income: number): number {
  return parseFloat((income * 0.025).toFixed(2));
}

export function getDaysInMonth(year: number, month: number): string[] {
  const count = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: count }, (_, i) =>
    format(new Date(year, month, i + 1), "yyyy-MM-dd"),
  );
}

export function getDayName(date: string): string {
  const days = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];
  try {
    return days[parseISO(date).getDay()];
  } catch {
    return "";
  }
}

export function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function prevMonthKey(mk: string): string {
  const [y, m] = mk.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function nextMonthKey(mk: string): string {
  const [y, m] = mk.split("-").map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthKeyLabel(mk: string): string {
  const months = [
    "يناير",
    "فبراير",
    "مارس",
    "إبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];
  const [y, m] = mk.split("-").map(Number);
  return `${months[m - 1]} ${y}`;
}

export function monthKeyFromDate(date: string): string {
  return date.slice(0, 7);
}

export const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "إبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];
