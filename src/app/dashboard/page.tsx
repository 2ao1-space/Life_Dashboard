"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { gsap } from "gsap";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import {
  Sun,
  Moon,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Pin,
  PinOff,
  Pencil,
  X,
  GripVertical,
  Heart,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Check,
  BarChart2,
  BookOpen,
  Star,
  Settings,
  Wifi,
  WifiOff,
  Wallet,
  Edit3,
  Banknote,
  User,
  CheckCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useFinanceStore } from "@/store/financeStore";
import { usePrayerStore } from "@/store/prayerStore";
import { useNotesStore } from "@/store/notesStore";
import { useZakatStore } from "@/store/zakatStore";
import { useWalletStore } from "@/store/walletStore";
import { getDB, clearAllData } from "@/lib/db";
import {
  today,
  getDayName,
  formatCurrency,
  formatDate,
  formatTime,
  getDaysInMonth,
  ARABIC_MONTHS,
  monthKeyLabel,
  currentMonthKey,
  prevMonthKey,
  isIncomeType,
} from "@/lib/utils";
import {
  PRAYER_NAMES,
  PRAYER_LABELS,
  PRAYER_ICONS,
  DEFAULT_WALLETS,
} from "@/types";
import type { Transaction, Note, WalletId } from "@/types";
import {
  setupSyncListeners,
  flushSyncQueue,
  pullFromSupabase,
  onSyncStatus,
  type SyncStatus,
} from "@/lib/syncEngine";
import DayInvoice from "@/components/DayInvoice";
import AccountPanel from "@/components/AccountPanel";
import { useAuthStore } from "@/store/authStore";

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const isDark = saved ? saved === "dark" : mq.matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };
  return { dark, toggle };
}

function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>("idle");

  useEffect(() => {
    const unsub = onSyncStatus(setStatus);

    return () => {
      unsub();
    };
  }, []);

  return status;
}

function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.classList.toggle("modal-open", open);
    return () => document.body.classList.remove("modal-open");
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto"
            style={{ maxWidth: 720 }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div
              className="card rounded-b-none rounded-t-[24px] px-5 pt-3 pb-10 overflow-y-auto"
              style={{ maxHeight: "65vh" }}
            >
              <div
                className="w-10 h-1 rounded-full mx-auto mb-4"
                style={{ background: "var(--bg-muted)" }}
              />
              {title && (
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base">{title}</h3>
                  <button
                    className="btn btn-ghost p-2 rounded-full"
                    onClick={onClose}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function AnimNum({ value, color }: { value: number; color?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const obj = { v: prev.current };
    gsap.to(obj, {
      v: value,
      duration: 0.5,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = formatCurrency(Math.round(obj.v));
      },
    });
    prev.current = value;
  }, [value]);
  return (
    <span ref={ref} style={{ color }}>
      {formatCurrency(value)}
    </span>
  );
}

type TxType = "income" | "expense" | "salary";

const TX_META: Record<
  TxType,
  { label: string; color: string; placeholder: string }
> = {
  income: {
    label: "دخل",
    color: "var(--accent-green)",
    placeholder: "مبلغ الدخل...",
  },
  expense: {
    label: "مصروف",
    color: "var(--accent-red)",
    placeholder: "مبلغ المصروف...",
  },
  salary: {
    label: "مرتب",
    color: "var(--accent)",
    placeholder: "مبلغ المرتب...",
  },
};

function WalletPicker({
  value,
  onChange,
}: {
  value: WalletId;
  onChange: (id: WalletId) => void;
}) {
  const { wallets } = useWalletStore();
  return (
    <div className="flex gap-2 flex-wrap">
      {wallets.map((w) => (
        <button
          key={w.id}
          type="button"
          onClick={() => onChange(w.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
          style={{
            background: value === w.id ? w.color : "var(--bg-raised)",
            color: value === w.id ? "white" : "var(--text-2)",
            border: `1.5px solid ${value === w.id ? w.color : "var(--border)"}`,
          }}
        >
          <span>{w.icon}</span> {w.name}
        </button>
      ))}
    </div>
  );
}

function AddRow({ type, onDone }: { type: TxType; onDone: () => void }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [walletId, setWalletId] = useState<WalletId>("cash");
  const [saving, setSaving] = useState(false);
  const { addTransaction } = useFinanceStore();
  const { loadCurrentMonth } = useZakatStore();
  const { wallets } = useWalletStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    if (wallets.length > 0) setWalletId(wallets[0].id);
  }, [wallets]);

  const { label, color, placeholder } = TX_META[type];

  const save = async () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    setSaving(true);
    await addTransaction(n, type, walletId, note || undefined);
    if (type === "salary") await loadCurrentMonth();
    setSaving(false);
    setAmount("");
    setNote("");
    onDone();
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="card p-4 mt-2 space-y-3">
        <p className="text-sm font-semibold" style={{ color }}>
          إضافة {label}
        </p>
        <input
          ref={inputRef}
          type="number"
          inputMode="decimal"
          placeholder={placeholder}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          className="input text-lg font-bold"
          style={{ color }}
        />
        <input
          type="text"
          placeholder="الملاحظة (اختياري)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          className="input"
        />
        <div>
          <p
            className="text-[10px] font-semibold mb-1.5"
            style={{ color: "var(--text-3)" }}
          >
            المحفظة
          </p>
          <WalletPicker value={walletId} onChange={setWalletId} />
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-primary flex-1"
            onClick={save}
            disabled={!amount || saving}
          >
            {saving ? "..." : `حفظ ${label}`}
          </button>
          <button className="btn btn-ghost" onClick={onDone}>
            إلغاء
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function EditTxSheet({
  tx,
  onClose,
}: {
  tx: Transaction;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(String(tx.amount));
  const [note, setNote] = useState(tx.note || "");
  const [walletId, setWalletId] = useState<WalletId>(tx.walletId || "cash");
  const [saving, setSaving] = useState(false);
  const { updateTransaction } = useFinanceStore();

  const save = async () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    setSaving(true);
    await updateTransaction(tx.id!, n, walletId, note || undefined);
    setSaving(false);
    onClose();
  };

  return (
    <BottomSheet open onClose={onClose} title="تعديل المعاملة">
      <div className="space-y-3">
        <input
          type="number"
          inputMode="decimal"
          placeholder="المبلغ..."
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          className="input text-lg font-bold"
        />
        <input
          type="text"
          placeholder="الملاحظة..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="input"
        />
        <div>
          <p
            className="text-[10px] font-semibold mb-1.5"
            style={{ color: "var(--text-3)" }}
          >
            المحفظة
          </p>
          <WalletPicker value={walletId} onChange={setWalletId} />
        </div>
        <button
          className="btn btn-primary btn-full"
          onClick={save}
          disabled={!amount || saving}
        >
          {saving ? "..." : "حفظ التعديل"}
        </button>
      </div>
    </BottomSheet>
  );
}

function FinanceTab() {
  const {
    transactions,
    dayIncome,
    dayExpenses,
    walletBalances,
    totalBalance,
    isLoading,
    deleteTransaction,
  } = useFinanceStore();
  const { wallets } = useWalletStore();
  const [openRow, setOpenRow] = useState<TxType | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  const toggle = (t: TxType) => setOpenRow((prev) => (prev === t ? null : t));

  const handleDelete = async (tx: Transaction) => {
    if (!tx.id) return;
    if (confirmId !== tx.id) {
      setConfirmId(tx.id);
      setTimeout(() => setConfirmId((c) => (c === tx.id ? null : c)), 3000);
      return;
    }
    await deleteTransaction(tx.id);
    setConfirmId(null);
  };

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <p
          className="text-xs font-medium mb-1"
          style={{ color: "var(--text-3)" }}
        >
          الرصيد الإجمالي
        </p>
        <p className="text-3xl font-bold mb-4">
          <AnimNum
            value={totalBalance}
            color={
              totalBalance >= 0 ? "var(--accent-green)" : "var(--accent-red)"
            }
          />
        </p>

        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${Math.min(wallets.length, 3)}, 1fr)`,
          }}
        >
          {wallets.map((w) => {
            const bal = walletBalances[w.id] ?? 0;
            return (
              <div
                key={w.id}
                className="p-3 rounded-[var(--radius-md)]"
                style={{
                  background: `color-mix(in srgb, ${w.color} 12%, var(--bg-page))`,
                  border: `1px solid color-mix(in srgb, ${w.color} 25%, transparent)`,
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-base leading-none">{w.icon}</span>
                  <span
                    className="text-[11px] font-semibold"
                    style={{ color: w.color }}
                  >
                    {w.name}
                  </span>
                </div>
                <p
                  className="text-sm font-bold"
                  style={{ color: bal >= 0 ? w.color : "var(--accent-red)" }}
                >
                  {formatCurrency(bal)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <div
            className="p-2.5 rounded-[var(--radius-md)]"
            style={{ background: "var(--accent-green-bg)" }}
          >
            <p
              className="text-[10px] mb-0.5"
              style={{ color: "var(--accent-green)" }}
            >
              دخل اليوم
            </p>
            <p
              className="text-sm font-bold"
              style={{ color: "var(--accent-green)" }}
            >
              <AnimNum value={dayIncome} />
            </p>
          </div>
          <div
            className="p-2.5 rounded-[var(--radius-md)]"
            style={{ background: "var(--accent-red-bg)" }}
          >
            <p
              className="text-[10px] mb-0.5"
              style={{ color: "var(--accent-red)" }}
            >
              مصروف اليوم
            </p>
            <p
              className="text-sm font-bold"
              style={{ color: "var(--accent-red)" }}
            >
              <AnimNum value={dayExpenses} />
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          className="btn btn-green text-xs"
          onClick={() => toggle("income")}
        >
          <Plus size={13} /> دخل
        </button>
        <button
          className="btn btn-danger text-xs"
          onClick={() => toggle("expense")}
        >
          <Plus size={13} /> مصروف
        </button>
        <button
          className="btn btn-salary text-xs"
          onClick={() => toggle("salary")}
        >
          <Banknote size={13} /> مرتب
        </button>
      </div>

      <AnimatePresence>
        {openRow === "income" && (
          <AddRow key="i" type="income" onDone={() => setOpenRow(null)} />
        )}
        {openRow === "expense" && (
          <AddRow key="e" type="expense" onDone={() => setOpenRow(null)} />
        )}
        {openRow === "salary" && (
          <AddRow key="s" type="salary" onDone={() => setOpenRow(null)} />
        )}
      </AnimatePresence>

      <div>
        <p
          className="text-xs font-semibold mb-2 uppercase tracking-wider"
          style={{ color: "var(--text-3)" }}
        >
          معاملات اليوم ({transactions.length})
        </p>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div
            className="card p-6 text-center"
            style={{ color: "var(--text-3)" }}
          >
            <p className="text-sm">لا توجد معاملات اليوم</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {transactions.map((tx) => {
              const isSalary = tx.type === "salary";
              const isInc = tx.type === "income" || isSalary;
              const isCharity = tx.type === "charity";
              const color = isSalary
                ? "var(--accent)"
                : isInc
                  ? "var(--accent-green)"
                  : isCharity
                    ? "var(--accent-amber)"
                    : "var(--accent-red)";
              const bg = isSalary
                ? "var(--accent-light)"
                : isInc
                  ? "var(--accent-green-bg)"
                  : isCharity
                    ? "var(--accent-amber-bg)"
                    : "var(--accent-red-bg)";
              const txLabel =
                tx.note ||
                (isSalary
                  ? "مرتب"
                  : isInc
                    ? "دخل"
                    : isCharity
                      ? "صدقة"
                      : "مصروف");

              return (
                <motion.div
                  key={tx.id}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="card flex items-center gap-3 p-3 mb-2"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: bg }}
                  >
                    {isSalary ? (
                      <Banknote size={14} color={color} />
                    ) : isInc ? (
                      <TrendingUp size={14} color={color} />
                    ) : isCharity ? (
                      <Heart size={14} color={color} />
                    ) : (
                      <TrendingDown size={14} color={color} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{txLabel}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p
                        className="text-[10px]"
                        style={{ color: "var(--text-3)" }}
                      >
                        {formatTime(tx.timestamp)}
                      </p>
                      {(() => {
                        const w = wallets.find(
                          (w) => w.id === (tx.walletId || "cash"),
                        );
                        return w ? (
                          <span
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                            style={{
                              background: `color-mix(in srgb, ${w.color} 15%, var(--bg-page))`,
                              color: w.color,
                            }}
                          >
                            {w.icon} {w.name}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  </div>
                  <p
                    className="text-sm font-bold flex-shrink-0"
                    style={{ color }}
                  >
                    {isInc ? "+" : "−"}
                    {formatCurrency(tx.amount)}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditTx(tx)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: "var(--bg-muted)" }}
                    >
                      <Edit3 size={12} color="var(--text-3)" />
                    </button>
                    <button
                      onClick={() => handleDelete(tx)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        background:
                          confirmId === tx.id
                            ? "var(--accent-red)"
                            : "var(--bg-muted)",
                      }}
                    >
                      <Trash2
                        size={12}
                        color={confirmId === tx.id ? "white" : "var(--text-3)"}
                      />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {editTx && (
        <EditTxSheet
          key={editTx.id}
          tx={editTx}
          onClose={() => setEditTx(null)}
        />
      )}

      <ZakatSection />
    </div>
  );
}

function ZakatSection() {
  const {
    currentMonth,
    currentPayments,
    allMonths,
    monthlySalary,
    loadCurrentMonth,
    addPayment,
    deletePayment,
    loadAllMonths,
  } = useZakatStore();

  const [open, setOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCurrentMonth();
  }, []);

  const m = currentMonth;
  const isClosed = m?.isClosed ?? false;
  const hasSalary = monthlySalary > 0;
  const remaining = m?.remaining ?? 0;
  const paidAmount = m?.paidAmount ?? 0;
  const total = m?.totalRequired ?? 0;
  const pct = total > 0 ? Math.min(100, (paidAmount / total) * 100) : 0;

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const save = async () => {
    const n = parseFloat(amount);
    if (!n || n <= 0 || !recipient.trim() || isClosed) return;
    setSaving(true);
    await addPayment(n, recipient.trim(), note || undefined, photo);
    setSaving(false);
    setAmount("");
    setRecipient("");
    setNote("");
    setPhoto(undefined);
    setOpen(false);
  };

  const fillRemaining = () => setAmount(String(Math.round(remaining)));

  return (
    <div className="card p-4">
      {!hasSalary && (
        <div
          className="flex items-center gap-2 mb-3 px-3 py-2.5 rounded-[var(--radius-md)] text-xs"
          style={{
            background: "var(--accent-amber-bg)",
            color: "var(--accent-amber)",
          }}
        >
          <Heart size={13} />
          <span>
            سجّل <strong>مرتب</strong> لحساب الزكاة فوراً (2.5% من راتبك) 🤲
          </span>
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "var(--accent-amber-bg)" }}
          >
            <Heart size={14} color="var(--accent-amber)" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold">الزكاة الشهرية</p>
              {m && (
                <span
                  className="badge text-[10px]"
                  style={{
                    background: "var(--bg-muted)",
                    color: "var(--text-3)",
                  }}
                >
                  {monthKeyLabel(m.monthKey)}
                </span>
              )}
              {isClosed && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="badge text-[10px]"
                  style={{
                    background: "var(--accent-green-bg)",
                    color: "var(--accent-green)",
                  }}
                >
                  <CheckCheck size={16} /> مكتملة
                </motion.span>
              )}
            </div>
            <p className="text-xs" style={{ color: "var(--text-3)" }}>
              2.5% من صافي الرصيد
            </p>
          </div>
        </div>
        {!isClosed && (
          <button
            className="btn btn-ghost text-xs px-3 py-2"
            onClick={() => setOpen(true)}
          >
            <Plus size={13} /> سجل دفعة
          </button>
        )}
        {isClosed && (
          <div
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: "var(--accent-green)" }}
          >
            <CheckCircle2 size={14} />
            تم
          </div>
        )}
      </div>

      {m ? (
        <>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div
              className="p-2.5 rounded-[var(--radius-md)] text-center"
              style={{ background: "var(--bg-raised)" }}
            >
              <p
                className="text-[10px] mb-0.5"
                style={{ color: "var(--text-3)" }}
              >
                صافي الرصيد
              </p>
              <p
                className="text-xs font-bold"
                style={{ color: "var(--accent-green)" }}
              >
                {formatCurrency(m.totalRequired)}
              </p>
            </div>
            <div
              className="p-2.5 rounded-[var(--radius-md)] text-center"
              style={{ background: "var(--accent-amber-bg)" }}
            >
              <p
                className="text-[10px] mb-0.5"
                style={{ color: "var(--text-3)" }}
              >
                المطلوب{m.carriedOver > 0 ? " 📌" : ""}
              </p>
              <p
                className="text-xs font-bold"
                style={{ color: "var(--accent-amber)" }}
              >
                {formatCurrency(total)}
              </p>
            </div>
            <div
              className="p-2.5 rounded-[var(--radius-md)] text-center"
              style={{
                background: isClosed
                  ? "var(--accent-green-bg)"
                  : "var(--accent-red-bg)",
              }}
            >
              <p
                className="text-[10px] mb-0.5"
                style={{ color: "var(--text-3)" }}
              >
                المتبقي
              </p>
              <p
                className="text-xs font-bold"
                style={{
                  color: isClosed ? "var(--accent-green)" : "var(--accent-red)",
                }}
              >
                {formatCurrency(remaining)}
              </p>
            </div>
          </div>

          {m.carriedOver > 0 && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] mb-3 text-xs"
              style={{
                background: "var(--accent-amber-bg)",
                color: "var(--accent-amber)",
              }}
            >
              <span>📌</span>
              <span>
                يشمل <strong>{formatCurrency(m.carriedOver)}</strong> متبقي من
                الشهر السابق
              </span>
            </div>
          )}

          <div className="mb-3">
            <div
              className="flex justify-between text-[10px] mb-1"
              style={{ color: "var(--text-3)" }}
            >
              <span>تم دفع {formatCurrency(paidAmount)}</span>
              <span>{Math.round(pct)}%</span>
            </div>
            <div
              className="h-2.5 rounded-full overflow-hidden"
              style={{ background: "var(--bg-muted)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: isClosed
                    ? "var(--accent-green)"
                    : "var(--accent-amber)",
                }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-4" style={{ color: "var(--text-3)" }}>
          <p className="text-xs">جاري تحميل بيانات الزكاة...</p>
        </div>
      )}

      {currentPayments.length > 0 && (
        <div className="space-y-2 mb-2">
          <p
            className="text-xs font-semibold"
            style={{ color: "var(--text-3)" }}
          >
            دفعات هذا الشهر ({currentPayments.length})
          </p>
          {currentPayments.map((p) => (
            <div
              key={p.id}
              className="flex items-start gap-2 p-3 rounded-[var(--radius-md)]"
              style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
              }}
            >
              {p.photoDataUrl && (
                <img
                  src={p.photoDataUrl}
                  alt="إيصال"
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{p.recipient}</p>
                {p.note && (
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>
                    {p.note}
                  </p>
                )}
                <p className="text-xs" style={{ color: "var(--text-3)" }}>
                  {p.date}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <p
                  className="text-sm font-bold"
                  style={{ color: "var(--accent-amber)" }}
                >
                  {formatCurrency(p.amount)}
                </p>
                <button
                  onClick={() => deletePayment(p.id!)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--bg-muted)" }}
                >
                  <Trash2 size={11} color="var(--text-3)" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        className="btn btn-ghost btn-full text-xs mt-1"
        onClick={async () => {
          if (!showHistory) await loadAllMonths();
          setShowHistory((s) => !s);
        }}
      >
        {showHistory ? "إخفاء السجل" : "📋 سجل الشهور السابقة"}
      </button>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-2 space-y-2"
          >
            {allMonths
              .filter((mh) => mh.monthKey !== currentMonth?.monthKey)
              .map((mh) => (
                <div
                  key={mh.monthKey}
                  className="p-3 rounded-[var(--radius-md)]"
                  style={{
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold">
                      {monthKeyLabel(mh.monthKey)}
                    </p>
                    <span
                      className="badge text-[10px]"
                      style={{
                        background: mh.isClosed
                          ? "var(--accent-green-bg)"
                          : "var(--accent-red-bg)",
                        color: mh.isClosed
                          ? "var(--accent-green)"
                          : "var(--accent-red)",
                      }}
                    >
                      {mh.isClosed
                        ? "مكتمل"
                        : `متبقي ${formatCurrency(mh.remaining)}`}
                    </span>
                  </div>
                  <div
                    className="flex gap-3 text-[10px]"
                    style={{ color: "var(--text-3)" }}
                  >
                    <span>المطلوب: {formatCurrency(mh.totalRequired)}</span>
                    <span>المدفوع: {formatCurrency(mh.paidAmount)}</span>
                    {mh.carriedOver > 0 && (
                      <span style={{ color: "var(--accent-amber)" }}>
                        📌 مُرحَّل: {formatCurrency(mh.carriedOver)}
                      </span>
                    )}
                  </div>
                  <div
                    className="h-1 rounded-full mt-2 overflow-hidden"
                    style={{ background: "var(--bg-muted)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${mh.totalRequired > 0 ? Math.min(100, (mh.paidAmount / mh.totalRequired) * 100) : 0}%`,
                        background: mh.isClosed
                          ? "var(--accent-green)"
                          : "var(--accent-amber)",
                      }}
                    />
                  </div>
                </div>
              ))}
            {allMonths.filter((mh) => mh.monthKey !== currentMonth?.monthKey)
              .length === 0 && (
              <p
                className="text-xs text-center py-2"
                style={{ color: "var(--text-3)" }}
              >
                لا يوجد سجل سابق
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="تسجيل دفعة زكاة"
      >
        <div className="space-y-3">
          {m && remaining > 0 && (
            <div
              className="flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)]"
              style={{ background: "var(--accent-amber-bg)" }}
            >
              <span
                className="text-xs"
                style={{ color: "var(--accent-amber)" }}
              >
                المتبقي: <strong>{formatCurrency(remaining)}</strong>
              </span>
              <button
                className="btn btn-ghost text-xs px-2 py-1"
                onClick={fillRemaining}
              >
                دفع الكل
              </button>
            </div>
          )}

          <input
            type="number"
            inputMode="decimal"
            placeholder={`المبلغ (الحد الأقصى: ${formatCurrency(remaining)})...`}
            value={amount}
            onChange={(e) => {
              const n = parseFloat(e.target.value);
              if (!isNaN(n) && n > remaining) {
                setAmount(String(Math.round(remaining)));
              } else {
                setAmount(e.target.value);
              }
            }}
            className="input"
          />
          <input
            type="text"
            placeholder="دفعت لـ (اسم الجمعية أو الشخص)..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder="ملاحظة (اختياري)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input"
          />

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhoto}
          />
          {photo ? (
            <div className="relative">
              <img
                src={photo}
                alt="إيصال"
                className="w-full h-32 object-cover rounded-[var(--radius-md)]"
              />
              <button
                className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center"
                onClick={() => setPhoto(undefined)}
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-ghost btn-full"
              onClick={() => fileRef.current?.click()}
            >
              <ImagePlus size={15} /> رفع صورة الإيصال
            </button>
          )}

          <button
            className="btn btn-primary btn-full"
            onClick={save}
            disabled={
              !amount ||
              !recipient ||
              saving ||
              isClosed ||
              parseFloat(amount) <= 0
            }
          >
            {saving ? "جاري الحفظ..." : "حفظ الدفعة"}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

function PrayersTab() {
  const dateStr = today();
  const {
    prayers,
    loadPrayers,
    togglePrayer,
    getCompletedCount,
    isAllComplete,
  } = usePrayerStore();
  const [loaded, setLoaded] = useState(false);
  const p = prayers[dateStr];
  const count = getCompletedCount(dateStr);
  const done = isAllComplete(dateStr);

  useEffect(() => {
    loadPrayers(dateStr).then(() => setLoaded(true));
  }, [dateStr]);

  if (!loaded && !p)
    return (
      <div className="flex justify-center py-10">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-lg font-bold">صلوات اليوم</p>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>
              {count} من 5 مكتملة
            </p>
          </div>
          {done && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="badge"
              style={{
                background: "var(--accent-green-bg)",
                color: "var(--accent-green)",
              }}
            >
              ✨ مكتمل
            </motion.span>
          )}
        </div>

        <div
          className="h-1.5 rounded-full mb-5"
          style={{ background: "var(--bg-muted)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--accent)" }}
            animate={{ width: `${(count / 5) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <div className="grid grid-cols-5 gap-2">
          {PRAYER_NAMES.map((prayer) => {
            const checked = p[prayer];
            return (
              <motion.button
                key={prayer}
                whileTap={{ scale: 0.9 }}
                onClick={() => togglePrayer(dateStr, prayer)}
                className="flex flex-col items-center gap-1.5 py-4 rounded-[var(--radius-md)] transition-all"
                style={{
                  background: checked
                    ? "var(--accent-light)"
                    : "var(--bg-raised)",
                  border: `1.5px solid ${checked ? "var(--accent)" : "var(--border)"}`,
                }}
              >
                <span className="text-xl">{PRAYER_ICONS[prayer]}</span>
                <span
                  className="text-[11px] font-medium"
                  style={{ color: checked ? "var(--accent)" : "var(--text-2)" }}
                >
                  {PRAYER_LABELS[prayer]}
                </span>
                {checked ? (
                  <CheckCircle2 size={15} color="var(--accent)" />
                ) : (
                  <Circle size={15} color="var(--text-3)" />
                )}
              </motion.button>
            );
          })}
        </div>

        <p
          className="text-xs text-center mt-4"
          style={{ color: "var(--text-3)" }}
        >
          💡 يمكنك تعديل الصلوات في أي يوم سابق من التقارير
        </p>
      </div>

      <div className="card p-4 text-center">
        <p className="text-2xl mb-1">
          {count === 5 ? "🌟" : count >= 3 ? "✨" : "🤲"}
        </p>
        <p className="text-sm" style={{ color: "var(--text-2)" }}>
          {count === 5
            ? "ما شاء الله! أكملت صلواتك اليوم"
            : count >= 3
              ? `أحسنت! تبقى ${5 - count} صلاة`
              : "لا تنس صلواتك، هي عماد الدين"}
        </p>
      </div>
    </div>
  );
}

function NotesTab() {
  const {
    notes,
    loadNotes,
    addNote,
    updateNote,
    deleteNote,
    togglePin,
    reorderNotes,
  } = useNotesStore();
  const [newText, setNewText] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [unpinned, setUnpinned] = useState<Note[]>([]);

  useEffect(() => {
    loadNotes();
  }, []);
  useEffect(() => {
    setUnpinned(notes.filter((n) => !n.isPinned));
  }, [notes]);

  const pinned = notes.filter((n) => n.isPinned);

  const handleAdd = async () => {
    if (!newText.trim()) return;
    await addNote(newText.trim());
    setNewText("");
  };

  const handleEdit = async (id: number) => {
    if (!editText.trim()) return;
    await updateNote(id, editText.trim());
    setEditId(null);
  };

  const handleReorder = async (newOrder: Note[]) => {
    setUnpinned(newOrder);
    await reorderNotes(newOrder.map((n) => n.id!).filter(Boolean));
  };

  return (
    <div className="space-y-4">
      <div className="card p-3 flex gap-2">
        <input
          type="text"
          placeholder="اكتب ملاحظة جديدة..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="input flex-1"
        />
        <button
          className="btn btn-primary px-4"
          onClick={handleAdd}
          disabled={!newText.trim()}
        >
          <Plus size={16} />
        </button>
      </div>

      {pinned.length > 0 && (
        <div>
          <p
            className="text-xs font-semibold mb-2 uppercase tracking-wider"
            style={{ color: "var(--text-3)" }}
          >
            📌 مثبتة
          </p>
          <div className="space-y-2">
            {pinned.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                editId={editId}
                editText={editText}
                setEditId={setEditId}
                setEditText={setEditText}
                onEdit={handleEdit}
                onDelete={() => deleteNote(note.id!)}
                onTogglePin={() => togglePin(note.id!)}
              />
            ))}
          </div>
        </div>
      )}

      {unpinned.length > 0 && (
        <div>
          <p
            className="text-xs font-semibold mb-2 uppercase tracking-wider"
            style={{ color: "var(--text-3)" }}
          >
            📝 ملاحظاتك — اسحب لإعادة الترتيب
          </p>
          <Reorder.Group
            axis="y"
            values={unpinned}
            onReorder={handleReorder}
            className="space-y-2"
          >
            {unpinned.map((note) => (
              <Reorder.Item
                key={note.id}
                value={note}
                style={{ listStyle: "none" }}
              >
                <NoteCard
                  note={note}
                  editId={editId}
                  editText={editText}
                  setEditId={setEditId}
                  setEditText={setEditText}
                  onEdit={handleEdit}
                  onDelete={() => deleteNote(note.id!)}
                  onTogglePin={() => togglePin(note.id!)}
                  showHandle
                />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}

      {notes.length === 0 && (
        <div
          className="card p-8 text-center"
          style={{ color: "var(--text-3)" }}
        >
          <p className="text-2xl mb-2">📝</p>
          <p className="text-sm">لا توجد ملاحظات</p>
        </div>
      )}
    </div>
  );
}

function NoteCard({
  note,
  editId,
  editText,
  setEditId,
  setEditText,
  onEdit,
  onDelete,
  onTogglePin,
  showHandle,
}: {
  note: Note;
  editId: number | null;
  editText: string;
  setEditId: (id: number | null) => void;
  setEditText: (t: string) => void;
  onEdit: (id: number) => void;
  onDelete: () => void;
  onTogglePin: () => void;
  showHandle?: boolean;
}) {
  const isEditing = editId === note.id;

  return (
    <motion.div layout className="card p-3 flex items-start gap-2">
      {showHandle && (
        <div
          className="mt-1 flex-shrink-0 cursor-grab active:cursor-grabbing"
          style={{ color: "var(--text-3)" }}
        >
          <GripVertical size={16} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex gap-2">
            <input
              autoFocus
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onEdit(note.id!);
                if (e.key === "Escape") setEditId(null);
              }}
              className="input flex-1 text-sm py-2"
            />
            <button
              className="btn btn-primary px-3 py-2"
              onClick={() => onEdit(note.id!)}
            >
              <Check size={14} />
            </button>
            <button
              className="btn btn-ghost px-3 py-2"
              onClick={() => setEditId(null)}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <p
            className="text-sm leading-relaxed"
            style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
          >
            {note.content}
          </p>
        )}
      </div>
      {!isEditing && (
        <div className="flex gap-1 flex-shrink-0">
          <button
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--bg-input)" }}
            onClick={() => {
              setEditId(note.id!);
              setEditText(note.content);
            }}
          >
            <Pencil size={11} color="var(--text-3)" />
          </button>
          <button
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--bg-input)" }}
            onClick={onTogglePin}
          >
            {note.isPinned ? (
              <PinOff size={11} color="var(--accent-amber)" />
            ) : (
              <Pin size={11} color="var(--text-3)" />
            )}
          </button>
          <button
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--bg-input)" }}
            onClick={onDelete}
          >
            <Trash2 size={11} color="var(--text-3)" />
          </button>
        </div>
      )}
    </motion.div>
  );
}

function ReportsTab() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [selDate, setSelDate] = useState(today());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [chartData, setChartData] = useState<
    { label: string; income: number; expense: number }[]
  >([]);
  const [summary, setSummary] = useState({ income: 0, expenses: 0 });
  const [dayTxs, setDayTxs] = useState<Transaction[]>([]);
  const year = now.getFullYear();
  const todayStr = today();

  const {
    prayers,
    loadPrayers,
    togglePrayer,
    getCompletedCount,
    hasMissedPrayers,
  } = usePrayerStore();
  const dayPrayer = prayers[selDate];

  useEffect(() => {
    const load = async () => {
      const db = getDB();
      const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const end = `${year}-${String(month + 1).padStart(2, "0")}-31`;
      const txs = await db.transactions
        .where("date")
        .between(start, end, true, true)
        .toArray();
      const days = getDaysInMonth(year, month);
      const byDay: Record<string, { income: number; expense: number }> = {};
      days.forEach((d) => {
        byDay[d] = { income: 0, expense: 0 };
      });
      txs.forEach((tx) => {
        if (!byDay[tx.date]) byDay[tx.date] = { income: 0, expense: 0 };
        if (isIncomeType(tx.type)) byDay[tx.date].income += tx.amount;
        else byDay[tx.date].expense += tx.amount;
      });
      const totalInc = txs
        .filter((t) => isIncomeType(t.type))
        .reduce((s, t) => s + t.amount, 0);
      const totalExp = txs
        .filter((t) => !isIncomeType(t.type))
        .reduce((s, t) => s + t.amount, 0);
      setSummary({ income: totalInc, expenses: totalExp });
      setChartData(
        days.map((d) => ({
          label: format(parseISO(d), "d"),
          income: byDay[d].income,
          expense: byDay[d].expense,
        })),
      );
    };
    load();
  }, [month]);

  useEffect(() => {
    const load = async () => {
      const db = getDB();
      const txs = await db.transactions.where("date").equals(selDate).toArray();
      txs.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
      setDayTxs(txs);
      await loadPrayers(selDate);
    };
    load();
  }, [selDate]);

  const days = getDaysInMonth(year, viewMonth);
  const firstDow = parseISO(days[0]).getDay();
  const DAYS_AR = ["أح", "إث", "ثل", "أر", "خم", "جم", "سب"];
  const dayIncome = dayTxs
    .filter((t) => isIncomeType(t.type))
    .reduce((s, t) => s + t.amount, 0);
  const dayExpense = dayTxs
    .filter((t) => !isIncomeType(t.type))
    .reduce((s, t) => s + t.amount, 0);
  const selPrayerCount = getCompletedCount(selDate);

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4">
        {ARABIC_MONTHS.map((m, i) => (
          <button
            key={i}
            onClick={() => setMonth(i)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: month === i ? "var(--accent)" : "var(--bg-raised)",
              color: month === i ? "white" : "var(--text-2)",
              border: "1px solid var(--border)",
            }}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          {
            label: "دخل",
            val: summary.income,
            color: "var(--accent-green)",
            bg: "var(--accent-green-bg)",
          },
          {
            label: "مصروف",
            val: summary.expenses,
            color: "var(--accent-red)",
            bg: "var(--accent-red-bg)",
          },
          {
            label: "صافي",
            val: summary.income - summary.expenses,
            color:
              summary.income >= summary.expenses
                ? "var(--accent-green)"
                : "var(--accent-red)",
            bg: "var(--bg-raised)",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="card p-3"
            style={{ background: item.bg }}
          >
            <p className="text-xs mb-1" style={{ color: "var(--text-3)" }}>
              {item.label}
            </p>
            <p className="text-[11px] font-bold" style={{ color: item.color }}>
              {formatCurrency(item.val)}
            </p>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <p className="text-sm font-semibold mb-3">الدخل مقابل المصروفات</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={chartData} barSize={5} barGap={1}>
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--text-3)", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 11,
              }}
              cursor={false}
            />
            <Bar
              dataKey="income"
              fill="var(--accent-green)"
              radius={[3, 3, 0, 0]}
              name="دخل"
            />
            <Bar
              dataKey="expense"
              fill="var(--accent-red)"
              radius={[3, 3, 0, 0]}
              name="مصروف"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            className="w-8 h-8 rounded-xl btn btn-ghost p-0"
            onClick={() => setViewMonth((m) => (m === 0 ? 11 : m - 1))}
          >
            <ChevronRight size={16} />
          </button>
          <p className="font-bold text-sm">
            {ARABIC_MONTHS[viewMonth]} {year}
          </p>
          <button
            className="w-8 h-8 rounded-xl btn btn-ghost p-0"
            onClick={() => setViewMonth((m) => (m === 11 ? 0 : m + 1))}
          >
            <ChevronLeft size={16} />
          </button>
        </div>
        <div className="grid grid-cols-7 mb-1">
          {DAYS_AR.map((d) => (
            <p
              key={d}
              className="text-center text-[9px] py-1"
              style={{ color: "var(--text-3)" }}
            >
              {d}
            </p>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`e${i}`} />
          ))}
          {days.map((d) => {
            const isSel = d === selDate;
            const isToday = d === todayStr;
            const isFuture = d > todayStr;
            const missed = hasMissedPrayers(d);

            return (
              <motion.button
                key={d}
                whileTap={{ scale: 0.88 }}
                onClick={() => !isFuture && setSelDate(d)}
                disabled={isFuture}
                className="aspect-square rounded-[var(--radius-sm)] flex flex-col items-center justify-center text-xs font-medium relative"
                style={{
                  background: isSel
                    ? "var(--accent)"
                    : isToday
                      ? "var(--accent-light)"
                      : "transparent",
                  color: isSel
                    ? "white"
                    : isToday
                      ? "var(--accent)"
                      : "var(--text-2)",
                  opacity: isFuture ? 0.25 : 1,
                  border:
                    isToday && !isSel
                      ? "1.5px solid var(--accent)"
                      : "1.5px solid transparent",
                }}
              >
                {format(parseISO(d), "d")}
                {missed && !isSel && (
                  <span
                    className="w-1 h-1 rounded-full absolute bottom-1"
                    style={{ background: "var(--accent-red)" }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
        <p
          className="text-[10px] text-center mt-2"
          style={{ color: "var(--text-3)" }}
        >
          🔴 = صلاة فائتة يمكن تعديلها
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selDate}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-sm">
              {getDayName(selDate)} · {formatDate(selDate)}
            </p>
            <div className="flex gap-2 text-xs">
              {dayIncome > 0 && (
                <span style={{ color: "var(--accent-green)" }}>
                  +{formatCurrency(dayIncome)}
                </span>
              )}
              {dayExpense > 0 && (
                <span style={{ color: "var(--accent-red)" }}>
                  −{formatCurrency(dayExpense)}
                </span>
              )}
            </div>
          </div>

          {dayPrayer && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p
                  className="text-xs font-semibold"
                  style={{ color: "var(--text-2)" }}
                >
                  الصلوات ({selPrayerCount}/5)
                </p>
                {selDate !== todayStr && (
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--accent)" }}
                  >
                    قابلة للتعديل
                  </span>
                )}
              </div>
              <div className="flex gap-1.5">
                {PRAYER_NAMES.map((p) => (
                  <motion.button
                    key={p}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => togglePrayer(selDate, p)}
                    className="flex-1 flex flex-col items-center gap-1 py-2 rounded-[var(--radius-sm)] transition-all"
                    style={{
                      background: dayPrayer[p]
                        ? "var(--accent-light)"
                        : "var(--bg-raised)",
                      border: `1px solid ${dayPrayer[p] ? "var(--accent)" : "var(--border)"}`,
                    }}
                  >
                    <span className="text-xs">{PRAYER_ICONS[p]}</span>
                    {dayPrayer[p] ? (
                      <CheckCircle2 size={11} color="var(--accent)" />
                    ) : (
                      <Circle size={11} color="var(--text-3)" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {dayTxs.length === 0 ? (
            <p
              className="text-xs text-center py-2"
              style={{ color: "var(--text-3)" }}
            >
              لا توجد معاملات
            </p>
          ) : (
            <div className="space-y-1.5">
              {dayTxs.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-3 py-2 rounded-[var(--radius-sm)]"
                  style={{ background: "var(--bg-raised)" }}
                >
                  <span className="text-xs" style={{ color: "var(--text-2)" }}>
                    {tx.note ||
                      (tx.type === "salary"
                        ? "مرتب"
                        : isIncomeType(tx.type)
                          ? "دخل"
                          : "مصروف")}
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: isIncomeType(tx.type)
                        ? "var(--accent-green)"
                        : "var(--accent-red)",
                    }}
                  >
                    {isIncomeType(tx.type) ? "+" : "−"}
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const WALLET_PRESETS = [
  { icon: "💵", color: "var(--accent-green)" },
  { icon: "💳", color: "var(--accent)" },
  { icon: "📱", color: "#a855f7" },
  { icon: "🏦", color: "#0ea5e9" },
  { icon: "💰", color: "#f59e0b" },
];

function SettingsTab() {
  const [step, setStep] = useState<"idle" | "confirm" | "done">("idle");
  const [loading, setLoading] = useState(false);
  const syncStatus = useSyncStatus();
  const { wallets, addWallet, removeWallet } = useWalletStore();
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("💵");
  const [newColor, setNewColor] = useState("var(--accent-green)");

  const clear = async () => {
    setLoading(true);
    await clearAllData();
    setLoading(false);
    setStep("done");
  };

  const handleAddWallet = () => {
    if (!newName.trim()) return;
    addWallet(newName.trim(), newIcon, newColor);
    setNewName("");
    setShowAddWallet(false);
  };

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: "var(--accent-light)" }}
          >
            🌿
          </div>
          <div>
            <p className="font-bold">لوحة حياتي</p>
            <p className="text-xs" style={{ color: "var(--text-3)" }}>
              الإصدار 4.0 · Offline-first
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)]"
          style={{ background: "var(--bg-raised)" }}
        >
          <span className={`sync-dot ${syncStatus}`} />
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            {syncStatus === "synced"
              ? "متزامن ✓"
              : syncStatus === "syncing"
                ? "جاري..."
                : syncStatus === "offline"
                  ? "غير متصل — محفوظ محلياً"
                  : syncStatus === "error"
                    ? "خطأ في المزامنة"
                    : "جاهز"}
          </span>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-sm">💳 المحافظ</p>
          <button
            className="btn btn-ghost text-xs px-3 py-1.5"
            onClick={() => setShowAddWallet((p) => !p)}
          >
            <Plus size={12} /> إضافة
          </button>
        </div>

        <AnimatePresence>
          {showAddWallet && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-3"
            >
              <div
                className="p-3 rounded-[var(--radius-md)] space-y-2"
                style={{ background: "var(--bg-raised)" }}
              >
                <input
                  type="text"
                  placeholder="اسم المحفظة..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="input text-sm"
                />
                <div className="flex gap-2 flex-wrap">
                  {WALLET_PRESETS.map((p) => (
                    <button
                      key={p.icon}
                      type="button"
                      onClick={() => {
                        setNewIcon(p.icon);
                        setNewColor(p.color);
                      }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all"
                      style={{
                        background:
                          newIcon === p.icon
                            ? `color-mix(in srgb, ${p.color} 20%, var(--bg-page))`
                            : "var(--bg-muted)",
                        border: `2px solid ${newIcon === p.icon ? p.color : "transparent"}`,
                      }}
                    >
                      {p.icon}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary flex-1 text-xs"
                    onClick={handleAddWallet}
                    disabled={!newName.trim()}
                  >
                    إضافة
                  </button>
                  <button
                    className="btn btn-ghost text-xs"
                    onClick={() => setShowAddWallet(false)}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {wallets.map((w) => (
            <div
              key={w.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]"
              style={{ background: "var(--bg-raised)" }}
            >
              <span className="text-xl">{w.icon}</span>
              <span className="flex-1 text-sm font-semibold">{w.name}</span>
              {w.id !== "cash" && (
                <button
                  onClick={() => removeWallet(w.id)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--bg-muted)" }}
                >
                  <Trash2 size={11} color="var(--text-3)" />
                </button>
              )}
              {w.id === "cash" && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "var(--bg-muted)",
                    color: "var(--text-3)",
                  }}
                >
                  افتراضي
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        className="card p-5"
        style={{ border: "1.5px solid var(--accent-red-bg)" }}
      >
        <p className="font-bold mb-1" style={{ color: "var(--accent-red)" }}>
          🗑 مسح كل البيانات
        </p>
        <p className="text-sm mb-4" style={{ color: "var(--text-3)" }}>
          يمسح كل شيء من الجهاز. لا يمكن التراجع!
        </p>
        {step === "done" ? (
          <p
            className="text-sm font-semibold text-center"
            style={{ color: "var(--accent-green)" }}
          >
            تم المسح
          </p>
        ) : step === "confirm" ? (
          <div className="flex gap-2">
            <button
              className="btn btn-danger flex-1"
              onClick={clear}
              disabled={loading}
            >
              {loading ? "..." : "امسح كل شيء"}
            </button>
            <button
              className="btn btn-ghost flex-1"
              onClick={() => setStep("idle")}
            >
              إلغاء
            </button>
          </div>
        ) : (
          <button
            className="btn btn-danger btn-full"
            onClick={() => setStep("confirm")}
          >
            <Trash2 size={14} /> مسح كل البيانات
          </button>
        )}
      </div>
    </div>
  );
}

function SyncBar() {
  const status = useSyncStatus();
  if (status === "idle" || status === "synced") return null;
  const info: Record<string, { label: string; bg: string; color: string }> = {
    syncing: {
      label: "جاري المزامنة...",
      bg: "var(--accent-amber-bg)",
      color: "var(--accent-amber)",
    },
    offline: {
      label: "غير متصل — البيانات محفوظة محلياً",
      bg: "var(--bg-muted)",
      color: "var(--text-2)",
    },
    error: {
      label: "خطأ في المزامنة — سيعاد المحاولة",
      bg: "var(--accent-red-bg)",
      color: "var(--accent-red)",
    },
  };
  const d = info[status];
  if (!d) return null;
  return (
    <div
      className="px-4 py-2 flex items-center gap-2 text-xs font-medium"
      style={{ background: d.bg, color: d.color }}
    >
      {status === "offline" ? <WifiOff size={12} /> : <Wifi size={12} />}
      {d.label}
    </div>
  );
}

type Tab = "finance" | "prayers" | "notes" | "reports" | "settings";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "finance", label: "المالية", icon: <Wallet size={16} /> },
  { id: "prayers", label: "الصلوات", icon: <Star size={16} /> },
  { id: "notes", label: "الملاحظات", icon: <BookOpen size={16} /> },
  { id: "reports", label: "التقارير", icon: <BarChart2 size={16} /> },
  { id: "settings", label: "إعدادات", icon: <Settings size={16} /> },
];

export default function Page() {
  const { dark, toggle } = useTheme();
  const [tab, setTab] = useState<Tab>("finance");
  const [hydrated, setHydrated] = useState(false);
  const dateStr = today();
  const contentRef = useRef<HTMLDivElement>(null);

  const { loadTransactions } = useFinanceStore();
  const { loadPrayers } = usePrayerStore();
  const { loadNotes } = useNotesStore();

  const [invoiceDate, setInvoiceDate] = useState<string | null>(null);
  const [showAccount, setShowAccount] = useState(false);
  const { user, isOffline } = useAuthStore();

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    loadTransactions(dateStr);
    loadPrayers(dateStr);
    loadNotes();
    useWalletStore.getState().loadWallets();
    setupSyncListeners();
    pullFromSupabase().catch(() => {});
    flushSyncQueue().catch(() => {});
  }, [hydrated]);

  useEffect(() => {
    if (!contentRef.current) return;
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" },
    );
  }, [tab]);

  if (!hydrated) return null;

  return (
    <div style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div
          className="px-4 pt-6 pb-3 flex items-center justify-between"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            background: "var(--bg-page)",
          }}
        >
          <div>
            <p
              className="text-xs font-medium"
              style={{ color: "var(--text-3)" }}
            >
              {getDayName(dateStr)} · {format(new Date(), "d MMMM yyyy")}
            </p>
            <h1 className="text-xl font-bold mt-0.5">لوحة حياتك 🌿</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setInvoiceDate(dateStr)}
              title="فاتورة اليوم"
              style={{
                background: "var(--bg-raised)",
                border: "none",
                borderRadius: 8,
                padding: "6px 10px",
                cursor: "pointer",
                fontSize: 16,
                lineHeight: 1,
              }}
            >
              📋
            </button>

            <button
              onClick={() => setShowAccount(true)}
              style={{
                background: isOffline
                  ? "var(--bg-input)"
                  : "var(--accent-light)",
                border: "none",
                borderRadius: 10,
                padding: "7px 12px",
                cursor: "pointer",
                color: isOffline ? "var(--text-2)" : "var(--accent)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <User size={16} />
              {isOffline ? "بدون حساب" : user?.name || "حساب"}
              {!isOffline && (
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "var(--accent-green)",
                    display: "inline-block",
                  }}
                />
              )}
            </button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggle}
              className="w-10 h-10 rounded-full btn btn-ghost"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>
          </div>
        </div>

        <SyncBar />

        <div className="tab-bar px-3 py-2">
          <div className="flex gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[var(--radius-md)] text-[11px] font-semibold transition-all"
                style={{
                  background: tab === t.id ? "var(--accent)" : "transparent",
                  color: tab === t.id ? "white" : "var(--text-3)",
                }}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div ref={contentRef} className="px-4 py-4 pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {tab === "finance" && <FinanceTab />}
              {tab === "prayers" && <PrayersTab />}
              {tab === "notes" && <NotesTab />}
              {tab === "reports" && <ReportsTab />}
              {tab === "settings" && <SettingsTab />}
            </motion.div>
          </AnimatePresence>
        </div>

        {invoiceDate && (
          <DayInvoice date={invoiceDate} onClose={() => setInvoiceDate(null)} />
        )}
        {showAccount && <AccountPanel onClose={() => setShowAccount(false)} />}
      </div>
    </div>
  );
}
