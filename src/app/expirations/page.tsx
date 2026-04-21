"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { cn, formatDate } from "@/lib/utils";
import {
  getCertDaysRemaining,
  getCertStatus,
} from "@/lib/status";
import { StatusTag } from "@/components/status-tag";
import { SidePanel } from "@/components/side-panel";

interface Row {
  officerId: string;
  officerName: string;
  badge: string;
  unit: string;
  certId: string;
  certCode: string;
  certName: string;
  days: number;
  expiresAt: string;
  status: "expired" | "expiring" | "compliant";
}

export default function ExpirationsPage() {
  const { officers, now, renewCertification, logAudit } = useStore();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openOfficerId, setOpenOfficerId] = useState<string | null>(null);

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    for (const o of officers) {
      for (const c of o.certifications) {
        out.push({
          officerId: o.id,
          officerName: o.name,
          badge: o.badge,
          unit: o.unit,
          certId: c.id,
          certCode: c.code,
          certName: c.name,
          days: getCertDaysRemaining(c, now),
          expiresAt: c.expiresAt,
          status: getCertStatus(c, now),
        });
      }
    }
    return out.sort((a, b) => a.days - b.days);
  }, [officers, now]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.certId)),
    );
  };

  const selectedRows = rows.filter((r) => selected.has(r.certId));

  const bulkRenew = () => {
    for (const r of selectedRows) renewCertification(r.officerId, r.certId);
    setSelected(new Set());
  };

  const bulkNotify = () => {
    for (const r of selectedRows) {
      logAudit({
        actor: "admin",
        action: "notified",
        target: `${r.officerId} / ${r.certCode}`,
      });
    }
    setSelected(new Set());
  };

  return (
    <div>
      <div className="flex items-center justify-between border-b border-[color:var(--color-line)] bg-[color:var(--color-panel)]/60 px-4 py-2 text-[11px] uppercase tracking-[0.12em]">
        <div className="flex items-center gap-3">
          <span className="text-[color:var(--color-fg-strong)]">
            EXPIRATION QUEUE
          </span>
          <span className="text-[color:var(--color-muted)]">
            {rows.length} TOTAL · URGENCY SORTED
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider">
          <span className="text-[color:var(--color-muted)]">
            SELECTED {selected.size.toString().padStart(2, "0")}
          </span>
          <button
            onClick={bulkRenew}
            disabled={selected.size === 0}
            className="border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel-2)] px-2 py-1 hover:border-[color:var(--color-fg)] hover:text-[color:var(--color-fg-strong)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            BULK RENEW
          </button>
          <button
            onClick={bulkNotify}
            disabled={selected.size === 0}
            className="border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel-2)] px-2 py-1 hover:border-[color:var(--color-fg)] hover:text-[color:var(--color-fg-strong)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            BULK NOTIFY
          </button>
        </div>
      </div>

      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className="border-b border-[color:var(--color-line-strong)] bg-[color:var(--color-panel-2)] text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-dim)]">
            <th className="px-3 py-2 text-left">
              <input
                type="checkbox"
                checked={selected.size === rows.length && rows.length > 0}
                onChange={toggleAll}
                className="accent-[color:var(--color-accent)]"
              />
            </th>
            <th className="px-3 py-2 text-left">STATUS</th>
            <th className="px-3 py-2 text-right">DAYS</th>
            <th className="px-3 py-2 text-left">EXPIRES</th>
            <th className="px-3 py-2 text-left">OFFICER</th>
            <th className="px-3 py-2 text-left">UNIT</th>
            <th className="px-3 py-2 text-left">CERT</th>
            <th className="px-3 py-2 text-right">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.certId}
              className={cn(
                "border-b border-[color:var(--color-line)] hover:bg-[color:var(--color-panel)]",
                r.status === "expired" &&
                  "bg-[color:var(--color-danger)]/[0.04]",
              )}
            >
              <td className="px-3 py-1.5">
                <input
                  type="checkbox"
                  checked={selected.has(r.certId)}
                  onChange={() => toggle(r.certId)}
                  className="accent-[color:var(--color-accent)]"
                />
              </td>
              <td className="px-3 py-1.5">
                <StatusTag status={r.status} pulse />
              </td>
              <td
                className={cn(
                  "px-3 py-1.5 text-right tabular-nums",
                  r.status === "expired" &&
                    "text-[color:var(--color-danger)] urgent-glow",
                  r.status === "expiring" && "text-[color:var(--color-warn)]",
                  r.status === "compliant" && "text-[color:var(--color-ok)]",
                )}
              >
                {r.days < 0 ? `${Math.abs(r.days)}D OVER` : `${r.days}D`}
              </td>
              <td className="px-3 py-1.5 text-[color:var(--color-dim)]">
                {formatDate(new Date(r.expiresAt))}
              </td>
              <td className="px-3 py-1.5">
                <button
                  onClick={() => setOpenOfficerId(r.officerId)}
                  className="text-[color:var(--color-fg-strong)] hover:text-[color:var(--color-accent)]"
                >
                  {r.officerName}
                </button>{" "}
                <span className="text-[color:var(--color-muted)]">
                  #{r.badge}
                </span>
              </td>
              <td className="px-3 py-1.5 text-[color:var(--color-dim)]">
                {r.unit}
              </td>
              <td className="px-3 py-1.5">
                <span className="text-[color:var(--color-fg-strong)]">
                  {r.certCode}
                </span>{" "}
                <span className="text-[color:var(--color-muted)]">
                  {r.certName}
                </span>
              </td>
              <td className="px-3 py-1.5 text-right">
                <button
                  onClick={() =>
                    renewCertification(r.officerId, r.certId)
                  }
                  className="border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel-2)] px-2 py-0.5 text-[10px] uppercase tracking-wider hover:border-[color:var(--color-fg)] hover:text-[color:var(--color-fg-strong)]"
                >
                  RENEW
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <SidePanel
        officerId={openOfficerId}
        onClose={() => setOpenOfficerId(null)}
      />
    </div>
  );
}
