import { getDB } from "./db";
import { supabase } from "./supabase";
import type {
  Transaction,
  Prayer,
  Note,
  ZakatPayment,
  ZakatMonth,
} from "@/types";

export type SyncStatus = "idle" | "syncing" | "synced" | "offline" | "error";

type Listener = (s: SyncStatus) => void;
const listeners = new Set<Listener>();
let currentStatus: SyncStatus = "idle";
let listenersSetup = false;

export function onSyncStatus(fn: Listener) {
  listeners.add(fn);
  fn(currentStatus);
  return () => listeners.delete(fn);
}

function setStatus(s: SyncStatus) {
  if (currentStatus === s) return;
  currentStatus = s;
  listeners.forEach((fn) => fn(s));
}

export function isOnline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine;
}

async function getUserId(): Promise<string | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

async function enqueue(
  tableName: string,
  operation: "upsert" | "delete",
  localId: number,
  payload: object,
) {
  try {
    await getDB().syncQueue.add({
      tableName,
      operation,
      localId,
      payload: JSON.stringify(payload),
      createdAt: new Date(),
    });
  } catch (e) {
    console.error("enqueue error", e);
  }
}

const CONFLICT_KEY: Record<string, string> = {
  prayers: "user_id,date",
  transactions: "user_id,local_id",
  notes: "user_id,local_id",
  zakat_payments: "user_id,local_id",
  zakat_months: "user_id,month_key",
  charity_months: "user_id,month_key",
  charity_payments: "user_id,local_id",
};

async function pushToSupabase(
  tableName: string,
  operation: "upsert" | "delete",
  payload: any,
  userId: string,
) {
  const row = { ...payload, user_id: userId };
  const conflictKey = CONFLICT_KEY[tableName] ?? "user_id,local_id";

  if (operation === "upsert") {
    const { error } = await supabase
      .from(tableName)
      .upsert(row, { onConflict: conflictKey });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq("user_id", userId)
      .eq("local_id", payload.local_id);
    if (error) throw error;
  }
}

let isFlushing = false;
export async function flushSyncQueue() {
  if (!isOnline() || isFlushing) return;
  const userId = await getUserId();
  if (!userId) return;

  const db = getDB();
  const queue = await db.syncQueue.orderBy("createdAt").toArray();
  if (queue.length === 0) {
    setStatus("synced");
    return;
  }

  isFlushing = true;
  setStatus("syncing");
  let failed = 0;

  for (const item of queue) {
    try {
      await pushToSupabase(
        item.tableName,
        item.operation,
        JSON.parse(item.payload),
        userId,
      );
      await db.syncQueue.delete(item.id!);
    } catch (e) {
      failed++;
      console.error("flush error", item.tableName, e);
    }
  }
  isFlushing = false;
  setStatus(failed === 0 ? "synced" : "error");
}

let isPulling = false;
export async function pullFromSupabase() {
  if (!isOnline() || isPulling) return;
  const userId = await getUserId();
  if (!userId) return;

  isPulling = true;
  const db = getDB();
  setStatus("syncing");

  try {
    const [localTxIds, localNoteIds, localZakatIds] = await Promise.all([
      db.transactions.toCollection().primaryKeys(),
      db.notes.toCollection().primaryKeys(),
      db.zakatPayments.toCollection().primaryKeys(),
    ]);
    const txSet = new Set(localTxIds);
    const noteSet = new Set(localNoteIds);
    const zakatSet = new Set(localZakatIds);

    const [txRes, prayerRes, noteRes, zakatRes, monthRes] = await Promise.all([
      supabase.from("transactions").select("*").eq("user_id", userId),
      supabase.from("prayers").select("*").eq("user_id", userId),
      supabase.from("notes").select("*").eq("user_id", userId),
      supabase.from("zakat_payments").select("*").eq("user_id", userId),
      supabase.from("zakat_months").select("*").eq("user_id", userId),
    ]);

    if (txRes.data?.length) {
      const toAdd = txRes.data.filter((r) => !txSet.has(r.local_id));
      if (toAdd.length) {
        await db.transactions.bulkAdd(
          toAdd.map((r) => ({
            amount: r.amount,
            type: r.type,
            note: r.note,
            date: r.date,
            walletId: r.wallet_id || "cash",
            timestamp: new Date(r.timestamp),
            synced: true,
          })),
        );
      }
    }

    if (prayerRes.data?.length) {
      for (const r of prayerRes.data) {
        const existing = await db.prayers.where("date").equals(r.date).first();
        if (!existing) {
          await db.prayers.add({
            date: r.date,
            fajr: r.fajr,
            dhuhr: r.dhuhr,
            asr: r.asr,
            maghrib: r.maghrib,
            isha: r.isha,
            synced: true,
          });
        } else {
          await db.prayers.update(existing.id!, {
            fajr: existing.fajr || r.fajr,
            dhuhr: existing.dhuhr || r.dhuhr,
            asr: existing.asr || r.asr,
            maghrib: existing.maghrib || r.maghrib,
            isha: existing.isha || r.isha,
            synced: true,
          });
        }
      }
    }

    if (noteRes.data?.length) {
      const toAdd = noteRes.data.filter((r) => !noteSet.has(r.local_id));
      if (toAdd.length) {
        await db.notes.bulkAdd(
          toAdd.map((r) => ({
            content: r.content,
            date: r.date,
            isPinned: r.is_pinned,
            order: r.order,
            createdAt: new Date(r.created_at),
            synced: true,
          })),
        );
      }
    }

    if (zakatRes.data?.length) {
      const toAdd = zakatRes.data.filter((r) => !zakatSet.has(r.local_id));
      if (toAdd.length) {
        await db.zakatPayments.bulkAdd(
          toAdd.map((r) => ({
            amount: r.amount,
            recipient: r.recipient,
            note: r.note,
            photoDataUrl: r.photo_data_url,
            date: r.date,
            monthKey: r.month_key,
            timestamp: new Date(r.timestamp),
            synced: true,
          })),
        );
      }
    }

    if (monthRes.data?.length) {
      for (const r of monthRes.data) {
        const existing = await db.zakatMonths
          .where("monthKey")
          .equals(r.month_key)
          .first();
        if (!existing) {
          await db.zakatMonths.add({
            monthKey: r.month_key,
            salaryAmount: r.salary_amount,
            baseRequired: r.base_required,
            carriedOver: r.carried_over,
            totalRequired: r.total_required,
            paidAmount: r.paid_amount,
            remaining: r.remaining,
            isClosed: r.is_closed,
            synced: true,
          });
        }
      }
    }

    setStatus("synced");
  } catch (e) {
    console.error("pullFromSupabase error", e);
    setStatus("error");
  } finally {
    isPulling = false;
  }
}

async function smartSync(
  tableName: string,
  localId: number,
  payload: object,
  operation: "upsert" | "delete" = "upsert",
) {
  if (!isOnline()) {
    await enqueue(tableName, operation, localId, payload);
    setStatus("offline");
    return;
  }
  const userId = await getUserId();
  if (!userId) {
    await enqueue(tableName, operation, localId, payload);
    return;
  }
  try {
    setStatus("syncing");
    await pushToSupabase(tableName, operation, payload, userId);
    setStatus("synced");
    if (operation === "upsert") {
      const db = getDB();
      const map: Record<string, any> = {
        transactions: db.transactions,
        prayers: db.prayers,
        notes: db.notes,
        zakat_payments: db.zakatPayments,
        zakat_months: db.zakatMonths,
      };
      await map[tableName]?.update(localId, { synced: true });
    }
  } catch (e) {
    await enqueue(tableName, operation, localId, payload);
    setStatus("error");
  }
}

export async function syncUpsertTransaction(tx: Transaction & { id: number }) {
  await smartSync("transactions", tx.id, {
    local_id: tx.id,
    amount: tx.amount,
    type: tx.type,
    note: tx.note,
    date: tx.date,
    wallet_id: tx.walletId,
    timestamp: tx.timestamp,
  });
}
export async function syncDeleteTransaction(localId: number) {
  await smartSync("transactions", localId, { local_id: localId }, "delete");
}

export async function syncUpsertPrayer(prayer: Prayer & { id: number }) {
  await smartSync("prayers", prayer.id, {
    local_id: prayer.id,
    date: prayer.date,
    fajr: prayer.fajr,
    dhuhr: prayer.dhuhr,
    asr: prayer.asr,
    maghrib: prayer.maghrib,
    isha: prayer.isha,
  });
}

export async function syncUpsertNote(note: Note & { id: number }) {
  await smartSync("notes", note.id, {
    local_id: note.id,
    content: note.content,
    date: note.date,
    is_pinned: note.isPinned,
    order: note.order,
    created_at: note.createdAt,
  });
}
export async function syncDeleteNote(localId: number) {
  await smartSync("notes", localId, { local_id: localId }, "delete");
}

export async function syncUpsertZakat(zakat: ZakatPayment & { id: number }) {
  await smartSync("zakat_payments", zakat.id, {
    local_id: zakat.id,
    amount: zakat.amount,
    recipient: zakat.recipient,
    note: zakat.note,
    photo_data_url: zakat.photoDataUrl,
    date: zakat.date,
    month_key: zakat.monthKey,
    timestamp: zakat.timestamp,
  });
}
export async function syncDeleteZakat(localId: number) {
  await smartSync("zakat_payments", localId, { local_id: localId }, "delete");
}

export async function syncUpsertZakatMonth(month: ZakatMonth & { id: number }) {
  await smartSync("zakat_months", month.id, {
    local_id: month.id,
    month_key: month.monthKey,
    salary_amount: month.salaryAmount,
    base_required: month.baseRequired,
    carried_over: month.carriedOver,
    total_required: month.totalRequired,
    paid_amount: month.paidAmount,
    remaining: month.remaining,
    is_closed: month.isClosed,
  });
}

export function setupSyncListeners() {
  if (typeof window === "undefined" || listenersSetup) return;
  listenersSetup = true;
  window.addEventListener("online", async () => {
    setStatus("syncing");
    await flushSyncQueue();
  });
  window.addEventListener("offline", () => setStatus("offline"));
  if (!isOnline()) setStatus("offline");
}
