"use client";

import { cn } from "@/lib/utils";
import {
  getCertDaysRemaining,
  getCertStatus,
  getOfficerStatus,
  getSoonestExpiry,
} from "@/lib/status";
import type { Certification, Officer } from "@/lib/types";
import { ProgressBar } from "./progress-bar";
import { useStore } from "@/lib/store";

export function OfficerRow({
  officer,
  now,
  onSelect,
  selected,
}: {
  officer: Officer;
  now: Date;
  onSelect?: (id: string) => void;
  selected?: boolean;
}) {
  const { renewCertification, logAudit } = useStore();
  const status = getOfficerStatus(officer, now);
  const soonest = getSoonestExpiry(officer, now);
  const soonestDays = soonest ? getCertDaysRemaining(soonest, now) : null;

  return (
    <div
      onClick={() => onSelect?.(officer.id)}
      className={cn(
        "group grid cursor-pointer grid-cols-[180px_90px_1fr_140px_auto] items-center gap-4 border-b border-[color:var(--color-line)] px-4 py-2 text-[12px] transition-colors",
        "hover:bg-[color:var(--color-panel)]",
        selected && "bg-[color:var(--color-panel-2)]",
        status === "expired" && "bg-[color:var(--color-danger)]/[0.04]",
      )}
    >
      {/* Identity */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={cn(
            "inline-block h-2 w-2 shrink-0",
            status === "compliant" && "bg-[color:var(--color-ok)]",
            status === "expiring" && "bg-[color:var(--color-warn)]",
            status === "expired" &&
              "bg-[color:var(--color-danger)] urgent-glow",
          )}
        />
        <span className="truncate text-[color:var(--color-fg-strong)]">
          {officer.name}
        </span>
        <span className="shrink-0 text-[color:var(--color-muted)]">
          #{officer.badge}
        </span>
      </div>

      {/* Rank / unit */}
      <div className="truncate text-[11px] uppercase tracking-wider text-[color:var(--color-dim)]">
        {officer.rank} · {officer.unit}
      </div>

      {/* Cert tags + bars */}
      <div className="flex min-w-0 items-center gap-3 overflow-hidden">
        {officer.certifications.slice(0, 5).map((c) => (
          <CertChip key={c.id} cert={c} now={now} />
        ))}
        {officer.certifications.length > 5 && (
          <span className="text-[10px] text-[color:var(--color-muted)]">
            +{officer.certifications.length - 5}
          </span>
        )}
      </div>

      {/* Days remaining */}
      <div className="text-right tabular-nums">
        {soonestDays !== null ? (
          <span
            className={cn(
              "text-[13px]",
              soonestDays < 0 &&
                "text-[color:var(--color-danger)] urgent-glow",
              soonestDays >= 0 &&
                soonestDays <= 30 &&
                "text-[color:var(--color-warn)]",
              soonestDays > 30 && "text-[color:var(--color-ok)]",
            )}
          >
            {soonestDays < 0 ? `${Math.abs(soonestDays)}D OVER` : `${soonestDays}D`}
          </span>
        ) : (
          <span className="text-[color:var(--color-muted)]">—</span>
        )}
        <div className="text-[9px] uppercase tracking-wider text-[color:var(--color-muted)]">
          {soonest?.code ?? ""} NEXT
        </div>
      </div>

      {/* Inline actions */}
      <div
        className="flex items-center gap-1 opacity-0 group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <ActionBtn
          onClick={() => soonest && renewCertification(officer.id, soonest.id)}
          disabled={!soonest}
        >
          RENEW
        </ActionBtn>
        <ActionBtn onClick={() => onSelect?.(officer.id)}>ASSIGN</ActionBtn>
        <ActionBtn
          onClick={() =>
            logAudit({
              actor: "admin",
              action: "notified",
              target: `${officer.id}`,
            })
          }
        >
          NOTIFY
        </ActionBtn>
      </div>
    </div>
  );
}

function CertChip({ cert, now }: { cert: Certification; now: Date }) {
  const status = getCertStatus(cert, now);
  const days = getCertDaysRemaining(cert, now);
  // Fill represents fraction of lifetime remaining. If expired, zero.
  const total = Math.max(
    1,
    Math.round(
      (new Date(cert.expiresAt).getTime() -
        new Date(cert.issuedAt).getTime()) /
        86400_000,
    ),
  );
  const remainingFrac = Math.max(0, days) / total;

  return (
    <div className="flex min-w-[72px] flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "text-[10px] uppercase tracking-wider",
            status === "compliant" && "text-[color:var(--color-fg)]",
            status === "expiring" && "text-[color:var(--color-warn)]",
            status === "expired" &&
              "text-[color:var(--color-danger)] urgent-glow",
          )}
        >
          {cert.code}
        </span>
        <span className="text-[9px] tabular-nums text-[color:var(--color-muted)]">
          {days < 0 ? `-${Math.abs(days)}D` : `${days}D`}
        </span>
      </div>
      <ProgressBar value={remainingFrac} status={status} />
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel-2)] px-2 py-0.5 text-[10px] uppercase tracking-wider",
        "hover:border-[color:var(--color-fg)] hover:text-[color:var(--color-fg-strong)]",
        "disabled:cursor-not-allowed disabled:opacity-40",
      )}
    >
      {children}
    </button>
  );
}
