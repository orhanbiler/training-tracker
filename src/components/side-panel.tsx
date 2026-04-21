"use client";

import { useEffect } from "react";
import { cn, formatDate } from "@/lib/utils";
import { useStore } from "@/lib/store";
import {
  getCertDaysRemaining,
  getCertStatus,
  getOfficerStatus,
} from "@/lib/status";
import { StatusTag } from "./status-tag";
import { ProgressBar } from "./progress-bar";

export function SidePanel({
  officerId,
  onClose,
}: {
  officerId: string | null;
  onClose: () => void;
}) {
  const { officers, training, files, now, renewCertification, assignToTraining } =
    useStore();

  // ESC to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!officerId) return null;
  const officer = officers.find((o) => o.id === officerId);
  if (!officer) return null;

  const status = getOfficerStatus(officer, now);
  const officerFiles = files.filter((f) => f.officerId === officer.id);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 fade-in"
        onClick={onClose}
      />
      <aside className="slide-in-right fixed right-0 top-0 z-50 flex h-full w-full max-w-[520px] flex-col border-l border-[color:var(--color-line-strong)] bg-[color:var(--color-panel)]">
        <header className="flex items-center justify-between border-b border-[color:var(--color-line)] px-4 py-3">
          <div className="flex items-center gap-3">
            <StatusTag status={status} pulse />
            <div>
              <div className="text-[15px] text-[color:var(--color-fg-strong)]">
                {officer.name}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-[color:var(--color-dim)]">
                {officer.rank} · BADGE #{officer.badge} · {officer.unit}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel-2)] px-2 py-1 text-[11px] uppercase tracking-wider hover:border-[color:var(--color-fg)] hover:text-[color:var(--color-fg-strong)]"
            aria-label="Close panel"
          >
            CLOSE · ESC
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          <section className="px-4 py-3">
            <SectionHeader label="CERTIFICATIONS" count={officer.certifications.length} />
            <ul className="mt-2 border border-[color:var(--color-line)]">
              {officer.certifications.map((c) => {
                const s = getCertStatus(c, now);
                const days = getCertDaysRemaining(c, now);
                const total = Math.max(
                  1,
                  Math.round(
                    (new Date(c.expiresAt).getTime() -
                      new Date(c.issuedAt).getTime()) /
                      86400_000,
                  ),
                );
                const remaining = Math.max(0, days) / total;
                return (
                  <li
                    key={c.id}
                    className="grid grid-cols-[80px_1fr_70px_auto] items-center gap-3 border-b border-[color:var(--color-line)] px-3 py-2 last:border-b-0"
                  >
                    <div className="text-[11px] uppercase tracking-wider text-[color:var(--color-fg-strong)]">
                      {c.code}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[12px] text-[color:var(--color-fg)]">
                          {c.name}
                        </span>
                        <StatusTag status={s} size="xs" />
                      </div>
                      <div className="mt-1">
                        <ProgressBar value={remaining} status={s} />
                      </div>
                      <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
                        <span>ISSUED {formatDate(new Date(c.issuedAt))}</span>
                        <span>EXPIRES {formatDate(new Date(c.expiresAt))}</span>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "text-right tabular-nums",
                        s === "expired" &&
                          "text-[color:var(--color-danger)] urgent-glow",
                        s === "expiring" && "text-[color:var(--color-warn)]",
                        s === "compliant" && "text-[color:var(--color-ok)]",
                      )}
                    >
                      {days < 0 ? `${Math.abs(days)}D OVER` : `${days}D`}
                    </div>
                    <button
                      onClick={() => renewCertification(officer.id, c.id)}
                      className="border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel-2)] px-2 py-1 text-[10px] uppercase tracking-wider hover:border-[color:var(--color-fg)] hover:text-[color:var(--color-fg-strong)]"
                    >
                      RENEW
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="px-4 py-3">
            <SectionHeader label="UPCOMING TRAINING" />
            <ul className="mt-2 border border-[color:var(--color-line)]">
              {training.map((t) => {
                const assigned = t.assignedOfficerIds.includes(officer.id);
                const date = new Date(t.date);
                return (
                  <li
                    key={t.id}
                    className="grid grid-cols-[60px_1fr_auto] items-center gap-3 border-b border-[color:var(--color-line)] px-3 py-2 last:border-b-0"
                  >
                    <div className="text-[11px] uppercase tracking-wider text-[color:var(--color-fg-strong)]">
                      {t.code}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[12px] text-[color:var(--color-fg)]">
                        {t.title}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
                        {formatDate(date)} · {t.location} · {t.instructor}
                      </div>
                    </div>
                    <button
                      onClick={() => assignToTraining(t.id, officer.id)}
                      disabled={assigned}
                      className={cn(
                        "border px-2 py-1 text-[10px] uppercase tracking-wider",
                        assigned
                          ? "border-[color:var(--color-ok)]/40 text-[color:var(--color-ok)]"
                          : "border-[color:var(--color-line-strong)] bg-[color:var(--color-panel-2)] hover:border-[color:var(--color-fg)] hover:text-[color:var(--color-fg-strong)]",
                      )}
                    >
                      {assigned ? "ASSIGNED" : "ASSIGN"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="px-4 py-3">
            <SectionHeader
              label="ATTACHED FILES"
              count={officerFiles.length}
            />
            {officerFiles.length === 0 ? (
              <div className="mt-2 border border-dashed border-[color:var(--color-line)] px-3 py-4 text-center text-[11px] uppercase tracking-wider text-[color:var(--color-muted)]">
                NO FILES ATTACHED
              </div>
            ) : (
              <ul className="mt-2 border border-[color:var(--color-line)]">
                {officerFiles.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between border-b border-[color:var(--color-line)] px-3 py-2 text-[11px] last:border-b-0"
                  >
                    <span className="truncate text-[color:var(--color-fg)]">
                      {f.name}
                    </span>
                    <span className="text-[color:var(--color-muted)]">
                      {(f.size / 1024).toFixed(0)} KB
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <footer className="flex items-center justify-between border-t border-[color:var(--color-line)] px-4 py-3 text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
          <span>ID {officer.id}</span>
          <span>UPDATED {formatDate(now)}</span>
        </footer>
      </aside>
    </>
  );
}

function SectionHeader({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-baseline justify-between border-b border-[color:var(--color-line)] pb-1 text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-dim)]">
      <span>{label}</span>
      {typeof count === "number" && (
        <span className="text-[color:var(--color-muted)]">
          {count.toString().padStart(2, "0")}
        </span>
      )}
    </div>
  );
}
