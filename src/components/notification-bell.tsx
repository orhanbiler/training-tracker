"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Bell, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { getCertDaysRemaining, getCertStatus } from "@/lib/status";

interface Alert {
  key: string;
  severity: "expired" | "urgent" | "soon";
  officerId: string;
  officerName: string;
  badge: string;
  certCode: string;
  certName: string;
  days: number;
}

const URGENT_WINDOW = 14; // days

export function NotificationBell() {
  const { officers, now } = useStore();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const alerts: Alert[] = useMemo(() => {
    const out: Alert[] = [];
    for (const o of officers) {
      for (const c of o.certifications) {
        const status = getCertStatus(c, now);
        if (status === "compliant") continue;
        const days = getCertDaysRemaining(c, now);
        out.push({
          key: `${o.id}-${c.id}`,
          severity:
            status === "expired"
              ? "expired"
              : days <= URGENT_WINDOW
              ? "urgent"
              : "soon",
          officerId: o.id,
          officerName: o.name,
          badge: o.badge,
          certCode: c.code,
          certName: c.name,
          days,
        });
      }
    }
    // Sort most urgent first: expired by most-days-over, then by days ascending.
    return out.sort((a, b) => {
      const sev = weight(a.severity) - weight(b.severity);
      if (sev !== 0) return sev;
      return a.days - b.days;
    });
  }, [officers, now]);

  const total = alerts.length;
  const expired = alerts.filter((a) => a.severity === "expired").length;
  const badgeText = total > 99 ? "99+" : String(total);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((x) => !x)}
        className={cn(
          "relative flex h-8 w-8 items-center justify-center border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel)]",
          open
            ? "border-[color:var(--color-fg)] text-[color:var(--color-fg-strong)]"
            : "hover:border-[color:var(--color-fg)]",
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Notifications (${total})`}
      >
        <Bell className="h-3.5 w-3.5" />
        {total > 0 && (
          <span
            className={cn(
              "absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-semibold text-[color:var(--color-fg-strong)]",
              expired > 0
                ? "bg-[color:var(--color-danger)] urgent-glow"
                : "bg-[color:var(--color-warn)]",
            )}
          >
            {badgeText}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="fade-in absolute right-0 top-[calc(100%+6px)] z-40 w-[380px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel)] shadow-lg"
        >
          <header className="flex items-center justify-between border-b border-[color:var(--color-line)] px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-fg-strong)]">
              NOTIFICATIONS
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
              {total} ACTIVE
            </span>
          </header>

          {total === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <CheckCircle2 className="h-6 w-6 text-[color:var(--color-ok)]" />
              <div className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-fg)]">
                ALL CLEAR
              </div>
              <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
                No expired or expiring certifications
              </div>
            </div>
          ) : (
            <>
              <ul className="max-h-[420px] overflow-y-auto">
                {alerts.slice(0, 20).map((a) => (
                  <li key={a.key}>
                    <Link
                      href="/expirations"
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 border-b border-[color:var(--color-line)] px-3 py-2 hover:bg-[color:var(--color-panel-2)]"
                    >
                      <SeverityIcon severity={a.severity} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[12px] text-[color:var(--color-fg-strong)]">
                            {a.officerName}{" "}
                            <span className="text-[color:var(--color-muted)]">
                              #{a.badge}
                            </span>
                          </span>
                          <DaysPill severity={a.severity} days={a.days} />
                        </div>
                        <div className="mt-0.5 truncate text-[10px] uppercase tracking-wider text-[color:var(--color-dim)]">
                          <span className="text-[color:var(--color-fg)]">
                            {a.certCode}
                          </span>{" "}
                          · {a.certName}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/expirations"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center border-t border-[color:var(--color-line)] px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-dim)] hover:bg-[color:var(--color-panel-2)] hover:text-[color:var(--color-fg-strong)]"
              >
                VIEW ALL EXPIRATIONS →
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function weight(s: Alert["severity"]): number {
  if (s === "expired") return 0;
  if (s === "urgent") return 1;
  return 2;
}

function SeverityIcon({ severity }: { severity: Alert["severity"] }) {
  if (severity === "expired")
    return (
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--color-danger)] urgent-glow" />
    );
  if (severity === "urgent")
    return (
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--color-warn)]" />
    );
  return (
    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--color-warn)]" />
  );
}

function DaysPill({
  severity,
  days,
}: {
  severity: Alert["severity"];
  days: number;
}) {
  const label =
    severity === "expired" ? `${Math.abs(days)}D OVER` : `${days}D`;
  return (
    <span
      className={cn(
        "shrink-0 border px-1.5 py-0.5 text-[9px] tabular-nums",
        severity === "expired"
          ? "border-[color:var(--color-danger)]/50 text-[color:var(--color-danger)]"
          : severity === "urgent"
          ? "border-[color:var(--color-warn)]/50 text-[color:var(--color-warn)]"
          : "border-[color:var(--color-line-strong)] text-[color:var(--color-dim)]",
      )}
    >
      {label}
    </span>
  );
}
