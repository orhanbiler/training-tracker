"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import {
  getCertDaysRemaining,
  getCertStatus,
} from "@/lib/status";
import { CERTIFICATION_CODES, CERTIFICATION_NAMES } from "@/lib/mock-data";
import type { Officer } from "@/lib/types";
import { SidePanel } from "./side-panel";

export function HeatmapGrid() {
  const { officers, now } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const codes = useMemo(() => {
    const present = new Set<string>();
    officers.forEach((o) =>
      o.certifications.forEach((c) => present.add(c.code)),
    );
    // Preserve catalog order; fall back to any present-only codes at the end.
    return [
      ...CERTIFICATION_CODES.filter((c) => present.has(c)),
      ...Array.from(present).filter((c) => !CERTIFICATION_CODES.includes(c)),
    ];
  }, [officers]);

  return (
    <>
      <div className="bg-[color:var(--color-panel)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[11px]">
            <thead className="sticky top-11 z-10 bg-[color:var(--color-panel)]">
              <tr className="border-b border-[color:var(--color-line)]">
                <th className="sticky left-0 z-10 w-[220px] bg-[color:var(--color-panel)] px-4 py-2 text-left text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-dim)]">
                  OFFICER
                </th>
                {codes.map((code) => (
                  <th
                    key={code}
                    className="border-l border-[color:var(--color-line)] px-2 py-2 text-[10px] uppercase tracking-wider text-[color:var(--color-dim)]"
                    title={CERTIFICATION_NAMES[code] ?? code}
                  >
                    <span className="block text-[color:var(--color-fg)]">
                      {code}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {officers.map((o) => (
                <HeatmapRow
                  key={o.id}
                  officer={o}
                  codes={codes}
                  now={now}
                  onOpen={() => setSelectedId(o.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
        <Legend />
      </div>
      <SidePanel officerId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}

function HeatmapRow({
  officer,
  codes,
  now,
  onOpen,
}: {
  officer: Officer;
  codes: string[];
  now: Date;
  onOpen: () => void;
}) {
  return (
    <tr className="border-b border-[color:var(--color-line)] hover:bg-[color:var(--color-panel-2)]">
      <td
        className="sticky left-0 z-0 bg-[color:var(--color-panel)] px-4 py-1.5 text-[12px]"
        onClick={onOpen}
      >
        <div className="flex items-center gap-2">
          <span className="text-[color:var(--color-fg-strong)]">
            {officer.name}
          </span>
          <span className="text-[color:var(--color-muted)]">
            #{officer.badge}
          </span>
        </div>
        <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
          {officer.rank} · {officer.unit}
        </div>
      </td>
      {codes.map((code) => {
        const cert = officer.certifications.find((c) => c.code === code);
        if (!cert) {
          return (
            <td
              key={code}
              className="border-l border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-0"
            >
              <div className="flex h-10 w-full items-center justify-center text-[color:var(--color-muted)]">
                —
              </div>
            </td>
          );
        }
        const s = getCertStatus(cert, now);
        const days = getCertDaysRemaining(cert, now);
        return (
          <td
            key={code}
            className="border-l border-[color:var(--color-line)] p-0"
          >
            <button
              onClick={onOpen}
              className={cn(
                "flex h-10 w-full flex-col items-center justify-center text-[10px] tabular-nums transition-colors",
                s === "compliant" &&
                  "bg-[color:var(--color-ok)]/15 text-[color:var(--color-ok)] hover:bg-[color:var(--color-ok)]/25",
                s === "expiring" &&
                  "bg-[color:var(--color-warn)]/15 text-[color:var(--color-warn)] hover:bg-[color:var(--color-warn)]/25",
                s === "expired" &&
                  "bg-[color:var(--color-danger)]/20 text-[color:var(--color-danger)] hover:bg-[color:var(--color-danger)]/30 urgent-glow",
              )}
            >
              <span>
                {days < 0
                  ? `-${Math.abs(days)}D`
                  : days > 999
                  ? "999D"
                  : `${days}D`}
              </span>
            </button>
          </td>
        );
      })}
    </tr>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-4 border-t border-[color:var(--color-line)] px-4 py-2 text-[10px] uppercase tracking-wider text-[color:var(--color-dim)]">
      <span>CELL = CERT STATUS · CLICK TO OPEN OFFICER</span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2 w-4 bg-[color:var(--color-ok)]/40" />
        COMPLIANT
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2 w-4 bg-[color:var(--color-warn)]/40" />
        EXPIRING
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2 w-4 bg-[color:var(--color-danger)]/40" />
        EXPIRED
      </span>
    </div>
  );
}
