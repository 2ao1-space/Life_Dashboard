"use client";

import type { InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Field({
  label,
  error,
  id,
  className = "",
  ...props
}: FieldProps) {
  const fieldId = id ?? label;
  return (
    <div className="mb-4">
      <label
        htmlFor={fieldId}
        className="mb-1.5 block text-xs font-semibold text-app-text-2"
      >
        {label}
      </label>
      <input
        id={fieldId}
        dir="rtl"
        className={`w-full rounded-card-sm border bg-app-bg px-3 py-2.5 text-sm text-app-text outline-none focus:border-app-primary ${
          error ? "border-app-danger" : "border-app-border"
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-app-danger">{error}</p>}
    </div>
  );
}
