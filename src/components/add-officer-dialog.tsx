"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { CERT_CATALOG } from "@/lib/certifications";
import { cn } from "@/lib/utils";

export function AddOfficerDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // Force a fresh state tree each time the dialog opens so we don't need a
  // reset-on-close useEffect.
  if (!open) return null;
  return <AddOfficerDialogBody onClose={onClose} />;
}

function AddOfficerDialogBody({ onClose }: { onClose: () => void }) {
  const { createOfficer } = useStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCerts, setSelectedCerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function toggleCert(code: string) {
    setSelectedCerts((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      const issuedAt = new Date();
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      const certifications = Array.from(selectedCerts).map((code) => {
        const catalog = CERT_CATALOG.find((c) => c.code === code);
        return {
          id: `cert-${code}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          code,
          name: catalog?.name ?? code,
          issuedAt: issuedAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
        };
      });

      await createOfficer({
        name: String(form.get("name") ?? "").trim(),
        badge: String(form.get("badge") ?? "").trim(),
        rank: String(form.get("rank") ?? "").trim() || "Ofc",
        unit: String(form.get("unit") ?? "").trim() || "Unassigned",
        certifications,
      });
      onClose();
    } catch (e) {
      setError(friendlyFirestoreError(e));
    } finally {
      setSubmitting(false);
    }
  }

  function friendlyFirestoreError(e: unknown): string {
    const code = (e as { code?: string })?.code;
    if (code === "permission-denied")
      return "PERMISSION DENIED — YOUR FIRESTORE RULES ARE BLOCKING WRITES";
    if (code === "unavailable")
      return "FIRESTORE UNAVAILABLE — CHECK YOUR CONNECTION";
    return (
      (e as Error)?.message?.toUpperCase?.() ?? "FAILED TO CREATE OFFICER"
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fade-in w-full max-w-[520px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel)]">
          <header className="flex items-center justify-between border-b border-[color:var(--color-line)] px-4 py-3">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-fg-strong)]">
                NEW OFFICER
              </div>
              <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
                Create a roster entry and optional certifications
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel-2)] text-[color:var(--color-dim)] hover:text-[color:var(--color-fg-strong)]"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </header>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="FULL NAME" name="name" required autoFocus />
              <Field label="BADGE #" name="badge" required />
              <Field label="RANK" name="rank" placeholder="Ofc" />
              <Field label="UNIT" name="unit" placeholder="Patrol A" />
            </div>

            <div>
              <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-dim)]">
                CERTIFICATIONS (ISSUED TODAY, EXPIRE IN 1Y)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CERT_CATALOG.map((c) => {
                  const active = selectedCerts.has(c.code);
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => toggleCert(c.code)}
                      className={cn(
                        "border px-2 py-1 text-[10px] uppercase tracking-wider",
                        active
                          ? "border-[color:var(--color-fg-strong)] bg-[color:var(--color-panel-2)] text-[color:var(--color-fg-strong)]"
                          : "border-[color:var(--color-line-strong)] text-[color:var(--color-dim)] hover:text-[color:var(--color-fg)]",
                      )}
                    >
                      {c.code}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="border border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/10 px-3 py-2 text-[10px] uppercase tracking-wider text-[color:var(--color-danger)]">
                {error}
              </div>
            )}

            <div className="mt-1 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel-2)] px-3 py-2 text-[10px] uppercase tracking-wider text-[color:var(--color-dim)] hover:text-[color:var(--color-fg-strong)]"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  "flex items-center gap-2 border border-[color:var(--color-fg-strong)] bg-[color:var(--color-fg-strong)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-bg)]",
                  "hover:bg-[color:var(--color-accent)] hover:border-[color:var(--color-accent)]",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                CREATE OFFICER
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
  autoFocus,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-dim)]">
        {label}
      </span>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          "border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-3 py-2 text-[12px] text-[color:var(--color-fg-strong)]",
          "placeholder:text-[color:var(--color-muted)]",
          "focus:border-[color:var(--color-accent)] focus:outline-none",
        )}
      />
    </label>
  );
}
