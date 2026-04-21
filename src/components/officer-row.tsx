"use client";

import {
  Calendar,
  MoreHorizontal,
  Send,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getCertDaysRemaining,
  getCertStatus,
  getOfficerStatus,
  getSoonestExpiry,
} from "@/lib/status";
import type { Certification, Officer } from "@/lib/types";
import { useStore } from "@/lib/store";

export function OfficerRow({
  officer,
  now,
  onSelect,
  selected,
  variant = "soon",
}: {
  officer: Officer;
  now: Date;
  onSelect?: (id: string) => void;
  selected?: boolean;
  /** Controls which columns are shown: expired has no days-left bar. */
  variant?: "expired" | "soon" | "compliant";
}) {
  const { renewCertification, assignToTraining, logAudit, training } =
    useStore();
  const status = getOfficerStatus(officer, now);
  const soonest = getSoonestExpiry(officer, now);
  const soonestDays = soonest ? getCertDaysRemaining(soonest, now) : null;

  const visibleCerts =
    variant === "expired"
      ? officer.certifications.filter(
          (c) => getCertStatus(c, now) === "expired",
        )
      : officer.certifications;

  const daysLabel =
    soonestDays === null
      ? "—"
      : soonestDays < 0
      ? `${Math.abs(soonestDays)} DAYS AGO`
      : `${soonestDays}`;

  const nextDate = soonest
    ? new Date(soonest.expiresAt).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "—";

  const handleRenew = () => soonest && renewCertification(officer.id, soonest.id);
  const handleAssign = () => {
    // Try to auto-assign to a matching upcoming session for the soonest cert.
    if (!soonest) return;
    const target = training.find((t) => t.code === soonest.code);
    if (target) assignToTraining(target.id, officer.id);
    else onSelect?.(officer.id);
  };
  const handleNotify = () =>
    logAudit({ actor: "admin", action: "notified", target: officer.id });

  return (
    <div
      onClick={() => onSelect?.(officer.id)}
      className={cn(
        "group grid cursor-pointer items-center gap-4 border-b border-[color:var(--color-line)] px-5 py-3 text-[12px] transition-colors",
        variant === "expired"
          ? "grid-cols-[minmax(0,220px)_80px_minmax(0,1fr)_160px_120px] hover:bg-[color:var(--color-panel)]"
          : "grid-cols-[minmax(0,220px)_80px_minmax(0,1fr)_140px_60px_140px] hover:bg-[color:var(--color-panel)]",
        selected && "bg-[color:var(--color-panel-2)]",
        status === "expired" && "bg-[color:var(--color-danger)]/[0.035]",
      )}
    >
      {/* Identity: avatar + name */}
      <div className="flex min-w-0 items-center gap-3">
        <Avatar
          name={officer.name}
          alert={status === "expired"}
          warn={status === "expiring"}
        />
        <div className="min-w-0">
          <div
            className={cn(
              "truncate",
              status === "expired"
                ? "text-[color:var(--color-danger)]"
                : "text-[color:var(--color-fg-strong)]",
            )}
          >
            {officer.rank}. {officer.name}
          </div>
          <div className="truncate text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
            {officer.unit}
          </div>
        </div>
      </div>

      {/* Badge */}
      <div className="text-[11px] tabular-nums text-[color:var(--color-dim)]">
        #{officer.badge}
      </div>

      {/* Cert chips */}
      <div className="flex min-w-0 flex-wrap items-center gap-1.5 overflow-hidden">
        {visibleCerts.slice(0, 3).map((c) => (
          <CertChip key={c.id} cert={c} now={now} />
        ))}
        {visibleCerts.length > 3 && (
          <span className="border border-[color:var(--color-line-strong)] px-1.5 py-0.5 text-[10px] tabular-nums text-[color:var(--color-dim)]">
            +{visibleCerts.length - 3}
          </span>
        )}
      </div>

      {/* Next expiration date */}
      <div className="tabular-nums text-right">
        <div
          className={cn(
            "text-[12px] uppercase tracking-wider",
            variant === "expired"
              ? "text-[color:var(--color-danger)]"
              : variant === "soon"
              ? "text-[color:var(--color-warn)]"
              : "text-[color:var(--color-fg)]",
          )}
        >
          {variant === "expired" ? daysLabel : nextDate}
        </div>
        {variant === "expired" && (
          <div className="text-[9px] uppercase tracking-wider text-[color:var(--color-muted)]">
            EXPIRED
          </div>
        )}
      </div>

      {/* Days-left slider + number (hidden for expired variant) */}
      {variant !== "expired" && (
        <>
          <div>
            <DaysBar
              days={soonestDays ?? null}
              total={180}
              variant={variant}
            />
          </div>
          <div className="flex items-center justify-end gap-4 text-right">
            <span
              className={cn(
                "text-[14px] tabular-nums",
                variant === "soon"
                  ? "text-[color:var(--color-warn)]"
                  : "text-[color:var(--color-ok)]",
              )}
            >
              {soonestDays ?? "—"}
            </span>
          </div>
        </>
      )}

      {/* Actions — always visible in last column */}
      <div
        className="flex items-center justify-end gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <IconBtn
          title="Schedule renewal"
          onClick={handleRenew}
          disabled={!soonest}
        >
          <Calendar className="h-3.5 w-3.5" />
        </IconBtn>
        {variant !== "expired" && (
          <IconBtn title="Assign training" onClick={handleAssign}>
            <UserPlus className="h-3.5 w-3.5" />
          </IconBtn>
        )}
        {variant !== "compliant" && (
          <IconBtn title="Notify officer" onClick={handleNotify}>
            <Send className="h-3.5 w-3.5" />
          </IconBtn>
        )}
        <IconBtn title="More" onClick={() => onSelect?.(officer.id)}>
          <MoreHorizontal className="h-3.5 w-3.5" />
        </IconBtn>
      </div>
    </div>
  );
}

function CertChip({ cert, now }: { cert: Certification; now: Date }) {
  const s = getCertStatus(cert, now);
  const d = getCertDaysRemaining(cert, now);
  const expired = s === "expired";
  const short = new Date(cert.expiresAt).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
  return (
    <div
      className={cn(
        "border px-2 py-1 text-[10px] uppercase leading-tight tracking-wider",
        s === "compliant" &&
          "border-[color:var(--color-line-strong)] text-[color:var(--color-fg)]",
        s === "expiring" &&
          "border-[color:var(--color-warn)]/50 text-[color:var(--color-warn)]",
        s === "expired" &&
          "border-[color:var(--color-danger)]/50 bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger)]",
      )}
      title={`${cert.name} · ${d < 0 ? `${Math.abs(d)}D over` : `${d}D left`}`}
    >
      <div className="font-medium">{cert.name}</div>
      <div
        className={cn(
          "mt-0.5 text-[9px] tabular-nums",
          expired
            ? "text-[color:var(--color-danger)]"
            : "text-[color:var(--color-muted)]",
        )}
      >
        {expired ? `EXPIRED ${short}` : short}
      </div>
    </div>
  );
}

function DaysBar({
  days,
  total,
  variant,
}: {
  days: number | null;
  total: number;
  variant: "soon" | "compliant";
}) {
  if (days === null) return null;
  const pct = Math.max(0, Math.min(1, days / total));
  const color =
    variant === "soon" ? "var(--color-warn)" : "var(--color-ok)";
  return (
    <div className="relative h-5 w-full">
      <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-[color:var(--color-line)]" />
      <div
        className="absolute top-1/2 h-[2px] -translate-y-1/2"
        style={{ width: `${pct * 100}%`, background: color, left: 0 }}
      />
      <div
        className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
        style={{
          left: `${pct * 100}%`,
          background: "var(--color-panel)",
          borderColor: color,
        }}
      />
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-7 w-7 items-center justify-center border border-transparent text-[color:var(--color-dim)]",
        "hover:border-[color:var(--color-line-strong)] hover:bg-[color:var(--color-panel-2)] hover:text-[color:var(--color-fg-strong)]",
        "disabled:cursor-not-allowed disabled:opacity-40",
      )}
    >
      {children}
    </button>
  );
}

function Avatar({
  name,
  alert,
  warn,
}: {
  name: string;
  alert?: boolean;
  warn?: boolean;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="relative h-8 w-8 shrink-0">
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel-2)] text-[10px] uppercase tracking-wider text-[color:var(--color-fg)]">
        {initials}
      </div>
      {alert && (
        <span className="absolute -bottom-0.5 -right-0.5 inline-block h-2.5 w-2.5 rounded-full border border-[color:var(--color-bg)] bg-[color:var(--color-danger)] urgent-glow" />
      )}
      {!alert && warn && (
        <span className="absolute -bottom-0.5 -right-0.5 inline-block h-2.5 w-2.5 rounded-full border border-[color:var(--color-bg)] bg-[color:var(--color-warn)]" />
      )}
    </div>
  );
}
