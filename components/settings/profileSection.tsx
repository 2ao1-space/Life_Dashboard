"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { calculateAge } from "@/lib/constants/date";
import Modal from "@/components/shared/Modal";
import Field from "@/components/shared/Field";
import Button from "@/components/shared/Button";

export default function ProfileSection() {
  const { profile, update } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const age = profile?.birth_date ? calculateAge(profile.birth_date) : null;

  const handleOpenModal = () => {
    setName(profile?.name ?? "");
    setBirthDate(profile?.birth_date ?? "");
    setIsOpen(true);
  };

  const handleSave = () => {
    update({ name: name.trim() || null, birth_date: birthDate || null });
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-3 rounded-card-lg border border-app-border bg-app-surface p-4 shadow-card">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-app-primary-soft text-xl font-extrabold text-app-primary-soft-text">
        {profile?.name?.[0] ?? "؟"}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-1.5 text-[15px] font-bold text-app-text">
          {profile?.name || "بدون اسم"}
          <span className="rounded-full bg-app-surface-2 px-2 py-0.5 text-[11px] font-normal text-app-text-2">
            اختياري
          </span>
        </div>
        <p className="text-xs text-app-text-2">
          {age !== null ? `${age} سنة` : "تقدر تسيبه فاضي وتستخدم التطبيق عادي"}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="shrink-0 text-xs font-bold text-app-primary"
      >
        تعديل
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="البروفايل"
        size="sm"
      >
        <Field
          label="الاسم (اختياري)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اكتب اسمك أو سيبه فاضي"
        />
        <Field
          label="تاريخ الميلاد (اختياري)"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
        <Button onClick={handleSave}>حفظ</Button>
      </Modal>
    </div>
  );
}
