"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn, pad } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { getOfficerStatus } from "@/lib/status";

const NAV: Array<{ href: string; label: string; key: string }> = [
  { href: "/", label: "TIMELINE", key: "01" },
  { href: "/grid", label: "GRID", key: "02" },
  { href: "/training", label: "TRAINING", key: "03" },
  { href: "/expirations", label: "EXPIRATIONS", key: "04" },
  { href: "/files", label: "FILES", key: "05" },
];

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function TopBar() {
  const pathname = usePathname();
  const now = useClock();
  const { officers, live } = useStore();

  const expired = officers.filter(
    (o) => getOfficerStatus(o) === "expired",
  ).length;
  const expiring = officers.filter(
    (o) => getOfficerStatus(o) === "expiring",
  ).length;
  const compliant = officers.filter(
    (o) => getOfficerStatus(o) === "compliant",
  ).length;

  const clockText = now
    ? `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())} UTC`
    : "--:--:-- UTC";

  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--color-line)] bg-[color:var(--color-bg)]/95 backdrop-blur">
      <div className="flex h-11 items-center justify-between px-4 text-[11px] uppercase tracking-[0.12em]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[color:var(--color-fg-strong)]">
            <span className="inline-block h-2 w-2 bg-[color:var(--color-ok)] urgent-glow" />
            <span className="font-semibold">TRN//OPS</span>
            <span className="text-[color:var(--color-muted)]">
              · POLICE TRAINING & CERT TRACKING
            </span>
          </div>
          <nav className="flex items-center gap-1">
            {NAV.map((n) => {
              const active =
                n.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "flex items-center gap-1.5 border px-2 py-1 transition-colors",
                    active
                      ? "border-[color:var(--color-fg-strong)] text-[color:var(--color-fg-strong)]"
                      : "border-[color:var(--color-line)] text-[color:var(--color-dim)] hover:border-[color:var(--color-line-strong)] hover:text-[color:var(--color-fg)]",
                  )}
                >
                  <span className="text-[color:var(--color-muted)]">
                    {n.key}
                  </span>
                  <span>{n.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-5 text-[color:var(--color-dim)]">
          <span>
            <span className="text-[color:var(--color-muted)]">EXP </span>
            <span className="text-[color:var(--color-danger)]">
              {pad(expired, 2)}
            </span>
          </span>
          <span>
            <span className="text-[color:var(--color-muted)]">SOON </span>
            <span className="text-[color:var(--color-warn)]">
              {pad(expiring, 2)}
            </span>
          </span>
          <span>
            <span className="text-[color:var(--color-muted)]">OK </span>
            <span className="text-[color:var(--color-ok)]">
              {pad(compliant, 2)}
            </span>
          </span>
          <span className="text-[color:var(--color-muted)]">|</span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5",
              live
                ? "text-[color:var(--color-ok)]"
                : "text-[color:var(--color-muted)]",
            )}
          >
            <span
              className={cn(
                "inline-block h-1.5 w-1.5",
                live
                  ? "bg-[color:var(--color-ok)]"
                  : "bg-[color:var(--color-muted)]",
              )}
            />
            {live ? "LIVE" : "DEMO"}
          </span>
          <span className="text-[color:var(--color-fg-strong)]" suppressHydrationWarning>
            {clockText}
          </span>
        </div>
      </div>
    </header>
  );
}
