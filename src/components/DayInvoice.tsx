"use client";
import { useEffect, useState } from "react";
import { X, TrendingUp, TrendingDown, Heart, Wallet, Moon } from "lucide-react";
import { getDB } from "@/lib/db";
import {
  formatCurrency,
  formatDate,
  getDayName,
  isIncomeType,
} from "@/lib/utils";
import { PRAYER_NAMES, PRAYER_LABELS, PRAYER_ICONS } from "@/types";
import type { Transaction, Prayer } from "@/types";

interface DayInvoiceProps {
  date: string;
  onClose: () => void;
}

interface DaySummary {
  transactions: Transaction[];
  prayer: Prayer | null;
  totalIncome: number;
  totalExpenses: number;
  totalCharity: number;
  totalSalary: number;
  netDay: number;
  prayerCount: number;
}

export default function DayInvoice({ date, onClose }: DayInvoiceProps) {
  const [summary, setSummary] = useState<DaySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDaySummary();
  }, [date]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function loadDaySummary() {
    setLoading(true);
    try {
      const db = getDB();
      const [txs, prayer] = await Promise.all([
        db.transactions.where("date").equals(date).toArray(),
        db.prayers.where("date").equals(date).first(),
      ]);

      txs.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      const totalIncome = txs
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
      const totalSalary = txs
        .filter((t) => t.type === "salary")
        .reduce((s, t) => s + t.amount, 0);
      const totalExpenses = txs
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);
      const totalCharity = txs
        .filter((t) => t.type === "charity")
        .reduce((s, t) => s + t.amount, 0);
      const netDay = totalIncome + totalSalary - totalExpenses - totalCharity;
      const prayerCount = prayer
        ? PRAYER_NAMES.filter((n) => prayer[n]).length
        : 0;

      setSummary({
        transactions: txs,
        prayer: prayer ?? null,
        totalIncome,
        totalExpenses,
        totalCharity,
        totalSalary,
        netDay,
        prayerCount,
      });
    } catch (e) {
      console.error("DayInvoice error", e);
    } finally {
      setLoading(false);
    }
  }

  const typeLabel: Record<string, string> = {
    income: "دخل",
    expense: "مصروف",
    salary: "مرتب",
    charity: "صدقة",
  };
  const typeColor: Record<string, string> = {
    income: "var(--accent-green)",
    expense: "var(--accent-red)",
    salary: "var(--accent)",
    charity: "var(--accent-amber)",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0 0 env(safe-area-inset-bottom)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-slide-up"
        style={{
          background: "var(--bg-card)",
          borderRadius: "20px 20px 0 0",
          width: "100%",
          maxWidth: 480,
          maxHeight: "85dvh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px 14px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div>
            <div
              style={{ fontSize: 17, fontWeight: 700, color: "var(--text-1)" }}
            >
              فاتورة {formatDate(date)}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 2 }}>
              {getDayName(date)}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--bg-input)",
              border: "none",
              borderRadius: 10,
              padding: 8,
              cursor: "pointer",
              color: "var(--text-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "16px 20px 24px" }}>
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: 40,
                color: "var(--text-3)",
              }}
            >
              جاري التحميل…
            </div>
          ) : !summary ? (
            <div
              style={{
                textAlign: "center",
                padding: 40,
                color: "var(--text-3)",
              }}
            >
              خطأ في التحميل
            </div>
          ) : summary.transactions.length === 0 && !summary.prayer ? (
            <div
              style={{
                textAlign: "center",
                padding: 40,
                color: "var(--text-3)",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
              لا توجد بيانات لهذا اليوم
            </div>
          ) : (
            <>
              {summary.transactions.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    marginBottom: 20,
                  }}
                >
                  {summary.totalSalary > 0 && (
                    <StatCard
                      icon={<Wallet size={16} />}
                      label="مرتب"
                      value={formatCurrency(summary.totalSalary)}
                      color="var(--accent)"
                      bg="var(--accent-light)"
                    />
                  )}
                  {summary.totalIncome > 0 && (
                    <StatCard
                      icon={<TrendingUp size={16} />}
                      label="دخل"
                      value={formatCurrency(summary.totalIncome)}
                      color="var(--accent-green)"
                      bg="var(--accent-green-bg)"
                    />
                  )}
                  {summary.totalExpenses > 0 && (
                    <StatCard
                      icon={<TrendingDown size={16} />}
                      label="مصاريف"
                      value={formatCurrency(summary.totalExpenses)}
                      color="var(--accent-red)"
                      bg="var(--accent-red-bg)"
                    />
                  )}
                  {summary.totalCharity > 0 && (
                    <StatCard
                      icon={<Heart size={16} />}
                      label="صدقة"
                      value={formatCurrency(summary.totalCharity)}
                      color="var(--accent-amber)"
                      bg="var(--accent-amber-bg)"
                    />
                  )}
                </div>
              )}

              {summary.transactions.length > 0 && (
                <div
                  style={{
                    background:
                      summary.netDay >= 0
                        ? "var(--accent-green-bg)"
                        : "var(--accent-red-bg)",
                    border: `1px solid ${summary.netDay >= 0 ? "var(--accent-green)" : "var(--accent-red)"}22`,
                    borderRadius: 14,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <span style={{ fontWeight: 600, color: "var(--text-2)" }}>
                    صافي اليوم
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 17,
                      color:
                        summary.netDay >= 0
                          ? "var(--accent-green)"
                          : "var(--accent-red)",
                    }}
                  >
                    {summary.netDay >= 0 ? "+" : ""}
                    {formatCurrency(summary.netDay)}
                  </span>
                </div>
              )}

              <div
                style={{
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: "14px 16px",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    color: "var(--text-2)",
                    marginBottom: 12,
                    fontSize: 14,
                  }}
                >
                  🕌 الصلوات — {summary.prayerCount} من 5
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {PRAYER_NAMES.map((name) => {
                    const done = summary.prayer?.[name] ?? false;
                    return (
                      <div
                        key={name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "6px 12px",
                          borderRadius: 99,
                          background: done
                            ? "var(--accent-green-bg)"
                            : "var(--bg-muted)",
                          border: `1px solid ${done ? "var(--accent-green)" : "var(--border)"}44`,
                          fontSize: 13,
                          fontWeight: 600,
                          color: done ? "var(--accent-green)" : "var(--text-3)",
                          transition: "all 0.2s",
                        }}
                      >
                        {PRAYER_ICONS[name]} {PRAYER_LABELS[name]}
                      </div>
                    );
                  })}
                </div>
              </div>

              {summary.transactions.length > 0 && (
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "var(--text-2)",
                      marginBottom: 12,
                      fontSize: 14,
                    }}
                  >
                    💳 المعاملات ({summary.transactions.length})
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {summary.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 14px",
                          borderRadius: 12,
                          background: "var(--bg-raised)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: typeColor[tx.type] ?? "var(--text-3)",
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: "var(--text-1)",
                              }}
                            >
                              {tx.note || typeLabel[tx.type] || tx.type}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "var(--text-3)",
                                marginTop: 2,
                              }}
                            >
                              {typeLabel[tx.type]}
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 15,
                            color: isIncomeType(tx.type)
                              ? "var(--accent-green)"
                              : "var(--accent-red)",
                          }}
                        >
                          {isIncomeType(tx.type) ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <div
      style={{
        background: bg,
        borderRadius: 12,
        padding: "12px 14px",
        border: `1px solid ${color}22`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color,
          marginBottom: 6,
        }}
      >
        {icon}
        <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
