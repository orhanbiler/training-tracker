"use client";

import { useId } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthForm({
  includeName = false,
  submitLabel,
  submitting,
  error,
  onSubmit,
}: {
  includeName?: boolean;
  submitLabel: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (data: FormData) => void | Promise<void>;
}) {
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(new FormData(e.currentTarget));
      }}
      className="mt-5 flex flex-col gap-3"
    >
      {includeName && (
        <Field
          id={nameId}
          name="name"
          label="FULL NAME"
          type="text"
          autoComplete="name"
          required
        />
      )}
      <Field
        id={emailId}
        name="email"
        label="EMAIL"
        type="email"
        autoComplete="email"
        required
      />
      <Field
        id={passwordId}
        name="password"
        label="PASSWORD"
        type="password"
        autoComplete={includeName ? "new-password" : "current-password"}
        required
        minLength={6}
      />

      {error && (
        <div className="flex items-start gap-2 border border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/10 px-3 py-2 text-[11px] uppercase tracking-wider text-[color:var(--color-danger)]">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={cn(
          "mt-1 flex items-center justify-center gap-2 border border-[color:var(--color-fg-strong)] bg-[color:var(--color-fg-strong)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-bg)]",
          "hover:bg-[color:var(--color-accent)] hover:border-[color:var(--color-accent)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {submitLabel}
      </button>
    </form>
  );
}

function Field({
  id,
  name,
  label,
  type,
  autoComplete,
  required,
  minLength,
}: {
  id: string;
  name: string;
  label: string;
  type: string;
  autoComplete: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-dim)]"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        className={cn(
          "border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-3 py-2 text-[12px] text-[color:var(--color-fg-strong)]",
          "placeholder:text-[color:var(--color-muted)]",
          "focus:border-[color:var(--color-accent)] focus:outline-none",
        )}
      />
    </div>
  );
}
