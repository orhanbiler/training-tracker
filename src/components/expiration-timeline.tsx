"use client";

import { useMemo } from "react";
import { cn, formatShortDate } from "@/lib/utils";
import { getCertDaysRemaining } from "@/lib/status";
import type { Officer } from "@/lib/types";

const WINDOW_DAYS = 90;

/**
 * Six 15-day buckets across the next 90 days. Each bucket condenses every
 * certification expiring in that window into a single cluster marker + a
 * count badge. Cluster color is driven purely by proximity:
 *   <= 15 days → danger
 *   <= 45 days → warn
 *   > 45 days  → ok
 */
const BUCKET_SIZE = 15;
const BUCKETS = Array.from({ length: WINDOW_DAYS / BUCKET_SIZE }, (_, i) => ({
  from: i * BUCKET_SIZE,
  to: (i + 1) * BUCKET_SIZE,
}));

type ClusterColor = "danger" | "warn" | "ok";

function colorFor(endDay: number): ClusterColor {
  if (endDay <= 15) return "danger";
  if (endDay <= 45) return "warn";
  return "ok";
}

const COLOR_TEXT: Record<ClusterColor, string> = {
  danger: "text-[color:var(--color-danger)]",
  warn: "text-[color:var(--color-warn)]",
  ok: "text-[color:var(--color-ok)]",
};
const COLOR_BG: Record<ClusterColor, string> = {
  danger: "bg-[color:var(--color-danger)]",
  warn: "bg-[color:var(--color-warn)]",
  ok: "bg-[color:var(--color-ok)]",
};

export function ExpirationTimeline({
  officers,
  now,
  onClick,
}: {
  officers: Officer[];
  now: Date;
  onClick?: () => void;
}) {
  const clusters = useMemo(() => {
    type Item = { officerId: string; days: number };
    const grouped = BUCKETS.map(() => [] as Item[]);
    for (const o of officers) {
      for (const c of o.certifications) {
        const d = getCertDaysRemaining(c, now);
        if (d < 0 || d > WINDOW_DAYS) continue;
        const idx = Math.min(
          BUCKETS.length - 1,
          Math.floor(d / BUCKET_SIZE),
        );
        grouped[idx].push({ officerId: o.id, days: d });
      }
    }
    return BUCKETS.map((b, i) => ({
      ...b,
      items: grouped[i],
      color: colorFor(b.to),
    }));
  }, [officers, now]);

  return (
    <section
      onClick={onClick}
      className={cn(
        "border border-[color:var(--color-line)] bg-[color:var(--color-panel)] px-5 py-4",
        onClick && "cursor-pointer hover:border-[color:var(--color-line-strong)]",
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-fg-strong)]">
            EXPIRATIONS TIMELINE
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
            NEXT {WINDOW_DAYS} DAYS
          </div>
        </div>
        <a
          href="/expirations"
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] uppercase tracking-wider text-[color:var(--color-dim)] hover:text-[color:var(--color-fg-strong)]"
        >
          VIEW EXPIRATIONS →
        </a>
      </div>

      <div className="relative mt-6 h-20">
        {/* Base axis */}
        <div className="absolute left-0 right-0 top-14 h-px bg-[color:var(--color-line-strong)]" />

        {/* Today tick */}
        <div className="absolute left-0 top-14 -translate-y-1/2">
          <div className="h-2 w-2 rounded-full bg-[color:var(--color-fg-strong)]" />
          <div className="absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-wider text-[color:var(--color-dim)]">
            TODAY
          </div>
        </div>

        {/* Clusters — one per bucket */}
        {clusters.map((c, i) => {
          // Position at the right edge of each bucket: (i+1)/N * 100%
          const pct = ((i + 1) / BUCKETS.length) * 100;
          const dateLabel = formatShortDate(
            new Date(now.getTime() + c.to * 86400_000),
          ).toUpperCase();
          const count = c.items.length;
          return (
            <div
              key={i}
              className="absolute top-0 bottom-0 -translate-x-1/2"
              style={{ left: `${pct}%` }}
            >
              {/* Count badge */}
              {count > 0 && (
                <div
                  className={cn(
                    "absolute top-0 left-1/2 -translate-x-1/2 flex h-6 min-w-6 items-center justify-center rounded-full border px-1.5 text-[11px] tabular-nums",
                    c.color === "danger" &&
                      "border-[color:var(--color-danger)]/60 bg-[color:var(--color-danger)]/15 text-[color:var(--color-danger)] urgent-glow",
                    c.color === "warn" &&
                      "border-[color:var(--color-warn)]/60 bg-[color:var(--color-warn)]/15 text-[color:var(--color-warn)]",
                    c.color === "ok" &&
                      "border-[color:var(--color-ok)]/60 bg-[color:var(--color-ok)]/15 text-[color:var(--color-ok)]",
                  )}
                >
                  {count}
                </div>
              )}

              {/* Dot cluster */}
              <div className="absolute top-10 left-1/2 flex -translate-x-1/2 items-center gap-0.5">
                {count === 0 ? (
                  <span
                    className={cn(
                      "h-1 w-1 rounded-full opacity-30",
                      COLOR_BG[c.color],
                    )}
                  />
                ) : (
                  Array.from({ length: Math.min(count, 6) }).map((_, j) => (
                    <span
                      key={j}
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        COLOR_BG[c.color],
                      )}
                    />
                  ))
                )}
              </div>

              {/* Date label */}
              <div
                className={cn(
                  "absolute top-[72px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-wider",
                  count > 0 ? COLOR_TEXT[c.color] : "text-[color:var(--color-muted)]",
                )}
              >
                {dateLabel}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
