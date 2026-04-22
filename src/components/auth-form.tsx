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
  onGoogle,
}: {
  includeName?: boolean;
  submitLabel: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (data: FormData) => void | Promise<void>;
  onGoogle?: () => void | Promise<void>;
}) {
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();

  return (
    <>
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

      {onGoogle && (
        <>
          <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
            <span className="h-px flex-1 bg-[color:var(--color-line)]" />
            OR
            <span className="h-px flex-1 bg-[color:var(--color-line)]" />
          </div>
          <button
            type="button"
            onClick={() => onGoogle()}
            disabled={submitting}
            className={cn(
              "flex w-full items-center justify-center gap-2 border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel-2)] px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-fg)]",
              "hover:border-[color:var(--color-fg)] hover:text-[color:var(--color-fg-strong)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            <GoogleIcon />
            CONTINUE WITH GOOGLE
          </button>
        </>
      )}
    </>
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

function GoogleIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
