"use client";

import { useState } from "react";
import { useAccounts } from "@/hooks/useAccounts";
import EntityActions from "@/components/shared/EntityActions";
import ConfirmModal from "@/components/shared/ConfirmModal";
import Modal from "@/components/shared/Modal";
import Field from "@/components/shared/Field";
import Button from "@/components/shared/Button";
import type { AccountEntity } from "@/types/settings";
import AppIcon from "@/components/shared/AppIcon";

const ICON_OPTIONS = [
  "account-cash",
  "account-bank",
  "account-phone",
  "account-card",
  "account-atm",
];

export default function AccountsSection() {
  const { accounts, addAccount, updateAccount, removeAccount, setDefaultAccount } =
    useAccounts();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<AccountEntity | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openAdd = () => {
    setEditing(null);
    setName("");
    setIcon(ICON_OPTIONS[0]);
    setIsFormOpen(true);
  };

  const openEdit = (account: AccountEntity) => {
    setEditing(account);
    setName(account.name);
    setIcon(account.icon);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editing) {
      updateAccount(editing.id, { name: name.trim(), icon });
    } else {
      addAccount({ name: name.trim(), icon });
    }
    setIsFormOpen(false);
  };

  return (
    <div>
      <div className="rounded-card-lg border border-app-border bg-app-surface shadow-card">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center gap-2.5 border-b border-app-border px-4 py-3 last:border-none"
          >
            <span className="min-w-0 flex-1 wrap-break-word text-[13.5px] font-semibold text-app-text">
              <span className="mr-1 inline-flex align-middle">
                <AppIcon name={account.icon} size={17} />
              </span>{" "}
              {account.name}
            </span>
            {account.is_default ? (
              <button
                type="button"
                onClick={() => setDefaultAccount(account.id)}
                className="rounded-full bg-app-gold-soft px-2.5 py-1 text-[10.5px] font-bold text-app-gold"
              >
                أساسي
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDefaultAccount(account.id)}
                  className="rounded-full bg-app-primary-soft px-2.5 py-1 text-[10.5px] font-bold text-app-primary-soft-text"
                >
                  افتراضي
                </button>
                <EntityActions
                  onEdit={() => openEdit(account)}
                  onDelete={() => setDeletingId(account.id)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={openAdd}
        className="mt-2.5 w-full rounded-card-md bg-app-primary-soft py-3 text-[13.5px] font-bold text-app-primary-soft-text"
      >
        ＋ إضافة حساب جديد
      </button>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editing ? "تعديل الحساب" : "حساب جديد"}
        size="sm"
      >
        <Field
          label="اسم الحساب"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثال: البنك الأهلي"
        />
        <div className="mb-4 flex gap-2">
          {ICON_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setIcon(opt)}
              className={`flex h-10 w-10 items-center justify-center rounded-card-sm border text-lg ${
                icon === opt
                  ? "border-app-primary bg-app-primary-soft"
                  : "border-app-border"
              }`}
            >
              <AppIcon name={opt} size={18} />
            </button>
          ))}
        </div>
        <Button onClick={handleSave} disabled={!name.trim()}>
          حفظ
        </Button>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) removeAccount(deletingId);
          setDeletingId(null);
        }}
        title="حذف الحساب"
        message="هيتحذف الحساب. المعاملات القديمة المرتبطة بيه هتفضل في السجل، بس مش هتقدر تضيف عليه معاملات جديدة."
      />
    </div>
  );
}
