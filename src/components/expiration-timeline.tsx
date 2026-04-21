"use client";

import { useMemo } from "react";
import { cn, formatShortDate } from "@/lib/utils";
import {
  getCertDaysRemaining,
  getCertStatus,
  EXPIRING_WINDOW_DAYS,
} from "@/lib/status";
import type { Officer } from "@/lib/types";

const WINDOW_DAYS = 90;
const TICK_EVERY = 15;

export function ExpirationTimeline({
  officers,
  now,
  onMarkerClick,
}: {
  officers: Officer[];
  now: Date;
  onMarkerClick?: (officerId: string, certId: string) => void;
}) {
  const markers = useMemo(() => {
    const out: Array<{
      officerId: string;
      officerName: string;
      badge: string;
      certId: string;
      certCode: string;
      days: number;
      status: "expired" | "expiring" | "compliant";
    }> = [];
    for (const o of officers) {
      for (const c of o.certifications) {
        const days = getCertDaysRemaining(c, now);
        if (days > WINDOW_DAYS) continue;
        out.push({
          officerId: o.id,
          officerName: o.name,
          badge: o.badge,
          certId: c.id,
          certCode: c.code,
          days,
          status: getCertStatus(c, now),
        });
      }
    }
    return out;
  }, [officers, now]);

  // % position along the 0..90 axis; expired items clamp to the far-left edge.
  const posFor = (days: number) => {
    const clamped = Math.max(0, Math.min(WINDOW_DAYS, days));
    return (clamped / WINDOW_DAYS) * 100;
  };

  const ticks: number[] = [];
  for (let d = 0; d <= WINDOW_DAYS; d += TICK_EVERY) ticks.push(d);

  const expiredCount = markers.filter((m) => m.status === "expired").length;

  return (
    <section className="border-b border-[color:var(--color-line)] bg-[color:var(--color-panel)]">
      <div className="flex items-center justify-between px-4 pt-3 text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-dim)]">
        <div className="flex items-center gap-3">
          <span className="text-[color:var(--color-fg-strong)]">
            EXPIRATION TIMELINE
          </span>
          <span className="text-[color:var(--color-muted)]">
            NEXT {WINDOW_DAYS} DAYS · {markers.length} EVENTS
          </span>
        </div>
        <div className="flex items-center gap-4">
          <LegendDot color="var(--color-danger)" label={`EXPIRED ${expiredCount}`} />
          <LegendDot color="var(--color-warn)" label={`≤ ${EXPIRING_WINDOW_DAYS}D`} />
          <LegendDot color="var(--color-ok)" label={`> ${EXPIRING_WINDOW_DAYS}D`} />
        </div>
      </div>

      <div className="relative mx-4 my-3 h-24">
        {/* Expired bucket (left gutter) */}
        <div className="absolute inset-y-0 left-0 w-[56px] border-r border-[color:var(--color-line)]">
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-muted)]">
              EXPIRED
            </span>
            <span
              className={cn(
                "text-lg tabular-nums",
                expiredCount > 0
                  ? "text-[color:var(--color-danger)] urgent-glow"
                  : "text-[color:var(--color-muted)]",
              )}
            >
              {expiredCount.toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Timeline track */}
        <div className="absolute inset-y-0 left-[64px] right-0">
          {/* Axis line */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-[color:var(--color-line-strong)]" />

          {/* Danger zone shading ( <=30 days ) */}
          <div
            className="absolute inset-y-0 left-0 bg-[color:var(--color-warn)]/5"
            style={{ width: `${(EXPIRING_WINDOW_DAYS / WINDOW_DAYS) * 100}%` }}
          />

          {/* Ticks */}
          {ticks.map((d) => (
            <div
              key={d}
              className="absolute top-0 bottom-0 border-l border-dashed border-[color:var(--color-line)]"
              style={{ left: `${posFor(d)}%` }}
            >
              <div className="absolute -top-px left-1 text-[9px] uppercase tracking-wider text-[color:var(--color-muted)]">
                {d === 0 ? "TODAY" : `+${d}D`}
              </div>
              <div className="absolute bottom-0 left-1 text-[9px] tabular-nums text-[color:var(--color-muted)]">
                {formatShortDate(
                  new Date(now.getTime() + d * 86400_000),
                )}
              </div>
            </div>
          ))}

          {/* Markers */}
          {markers
            .filter((m) => m.status !== "expired")
            .map((m, i) => (
              <button
                key={m.certId + i}
                onClick={() => onMarkerClick?.(m.officerId, m.certId)}
                className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${posFor(m.days)}%` }}
                title={`${m.officerName} · ${m.certCode} · ${m.days}D`}
              >
                <span
                  className={cn(
                    "block h-2.5 w-2.5 rotate-45 border",
                    m.status === "expiring"
                      ? "border-[color:var(--color-warn)] bg-[color:var(--color-warn)]/40"
                      : "border-[color:var(--color-ok)] bg-[color:var(--color-ok)]/30",
                  )}
                />
                <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 hidden -translate-x-1/2 whitespace-nowrap border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel-2)] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-[color:var(--color-fg)] group-hover:block">
                  {m.badge} · {m.certCode} · {m.days}D
                </span>
              </button>
            ))}

          {/* Today marker */}
          <div
            className="absolute top-0 bottom-0 w-px bg-[color:var(--color-accent)]"
            style={{ left: `${posFor(0)}%` }}
          >
            <span className="absolute -top-2 left-1 bg-[color:var(--color-bg)] px-1 text-[9px] uppercase tracking-wider text-[color:var(--color-accent)]">
              NOW
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-1.5 w-1.5" style={{ background: color }} />
      {label}
    </span>
  );
}
