"use client";
import { useState } from "react";
import {
  X,
  Link2,
  Trash2,
  LogOut,
  CheckCircle,
  AlertTriangle,
  Loader2,
  User,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface AccountPanelProps {
  onClose: () => void;
}

export default function AccountPanel({ onClose }: AccountPanelProps) {
  const {
    user,
    isOffline,
    loading,
    error,
    linkWithGoogle,
    signOut,
    clearAllUserData,
    clearMessages,
  } = useAuthStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleLinkGoogle() {
    clearMessages();
    await linkWithGoogle();
  }

  async function handleSignOut() {
    await signOut();
    onClose();
  }

  async function handleDeleteAll() {
    await clearAllUserData();
    setShowDeleteConfirm(false);
    onClose();
  }

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
          padding: "20px 20px 32px",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div
            style={{ fontSize: 17, fontWeight: 700, color: "var(--text-1)" }}
          >
            إعدادات الحساب
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

        <div
          style={{
            background: "var(--bg-raised)",
            borderRadius: 14,
            padding: "16px",
            marginBottom: 20,
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: isOffline ? "var(--bg-muted)" : "var(--accent-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isOffline ? "var(--text-3)" : "var(--accent)",
              flexShrink: 0,
            }}
          >
            <User size={22} />
          </div>
          <div style={{ minWidth: 0 }}>
            {isOffline ? (
              <>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--text-1)",
                  }}
                >
                  وضع بدون حساب
                </div>
                <div
                  style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}
                >
                  البيانات محفوظة على هذا الجهاز فقط
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--text-1)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {user?.name || user?.email || "حساب مرتبط"}
                  <CheckCircle size={15} color="var(--accent-green)" />
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-3)",
                    marginTop: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.email}
                </div>
              </>
            )}
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "var(--accent-red-bg)",
              border: "1px solid var(--accent-red)33",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 16,
              color: "var(--accent-red)",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {isOffline && (
            <button
              onClick={handleLinkGoogle}
              disabled={loading}
              className="btn btn-primary btn-full"
              style={{ gap: 10, padding: "14px 16px", fontSize: 15 }}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              ربط الحساب بـ Google (للنسخ الاحتياطي)
            </button>
          )}

          {!isOffline && (
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="btn btn-ghost btn-full"
              style={{ gap: 8, padding: "13px 16px" }}
            >
              <LogOut size={16} />
              تسجيل الخروج (الاستمرار بدون حساب)
            </button>
          )}

          <div
            style={{ height: 1, background: "var(--border)", margin: "4px 0" }}
          />

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn btn-danger btn-full"
              style={{ gap: 8, padding: "13px 16px" }}
            >
              <Trash2 size={16} />
              حذف كل البيانات
            </button>
          ) : (
            <div
              style={{
                background: "var(--accent-red-bg)",
                border: "1px solid var(--accent-red)33",
                borderRadius: 14,
                padding: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                  color: "var(--accent-red)",
                  fontWeight: 600,
                }}
              >
                <AlertTriangle size={18} />
                تأكيد حذف كل البيانات
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-2)",
                  marginBottom: 14,
                  lineHeight: 1.6,
                }}
              >
                سيتم حذف جميع المعاملات والصلوات والملاحظات والزكاة بشكل نهائي.
                لا يمكن التراجع عن هذا الإجراء.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleDeleteAll}
                  disabled={loading}
                  className="btn btn-danger"
                  style={{ flex: 1, gap: 6 }}
                >
                  {loading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                  نعم، احذف كل شيء
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 20,
            padding: "10px 14px",
            background: "var(--bg-raised)",
            borderRadius: 10,
            fontSize: 12,
            color: "var(--text-3)",
            lineHeight: 1.6,
          }}
        >
          {isOffline
            ? "ربط الحساب بـ Google يتيح لك الوصول إلى بياناتك من أي جهاز آخر"
            : "بياناتك محفوظة على السحابة ومتزامنة تلقائياً"}
        </div>
      </div>
    </div>
  );
}
