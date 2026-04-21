"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { getOfficerStatus } from "@/lib/status";
import { ExpirationTimeline } from "@/components/expiration-timeline";
import { OfficerRow } from "@/components/officer-row";
import { SidePanel } from "@/components/side-panel";
import { cn } from "@/lib/utils";
import type { CertStatus, Officer } from "@/lib/types";

const GROUP_ORDER: CertStatus[] = ["expired", "expiring", "compliant"];
const GROUP_LABEL: Record<CertStatus, string> = {
  expired: "EXPIRED",
  expiring: "EXPIRING SOON",
  compliant: "COMPLIANT",
};
const GROUP_COLOR: Record<CertStatus, string> = {
  expired: "var(--color-danger)",
  expiring: "var(--color-warn)",
  compliant: "var(--color-ok)",
};

export default function Page() {
  const { officers, now, audit } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return officers;
    return officers.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.badge.includes(q) ||
        o.unit.toLowerCase().includes(q) ||
        o.certifications.some((c) => c.code.toLowerCase().includes(q)),
    );
  }, [officers, query]);

  const groups = useMemo(() => {
    const buckets: Record<CertStatus, Officer[]> = {
      expired: [],
      expiring: [],
      compliant: [],
    };
    for (const o of filtered) buckets[getOfficerStatus(o, now)].push(o);
    return buckets;
  }, [filtered, now]);

  return (
    <>
      <ExpirationTimeline
        officers={filtered}
        now={now}
        onMarkerClick={(id) => setSelectedId(id)}
      />

      <div className="flex items-center justify-between gap-3 border-b border-[color:var(--color-line)] bg-[color:var(--color-panel)]/60 px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-dim)]">
        <div className="flex items-center gap-3">
          <span className="text-[color:var(--color-fg-strong)]">ROSTER</span>
          <span className="text-[color:var(--color-muted)]">
            {filtered.length} OFFICERS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH NAME / BADGE / UNIT / CERT"
            className="w-[320px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-2 py-1 text-[11px] uppercase tracking-wider text-[color:var(--color-fg)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px]">
        <div>
          {GROUP_ORDER.map((g) => {
            const rows = groups[g];
            if (rows.length === 0) return null;
            return (
              <section key={g}>
                <div
                  className="flex items-center gap-3 border-b border-[color:var(--color-line-strong)] bg-[color:var(--color-panel-2)] px-4 py-1.5 text-[11px] uppercase tracking-[0.14em]"
                  style={{ color: GROUP_COLOR[g] }}
                >
                  <span
                    className={cn(
                      "inline-block h-2 w-2",
                      g === "expired" && "urgent-glow",
                    )}
                    style={{ background: GROUP_COLOR[g] }}
                  />
                  <span>{GROUP_LABEL[g]}</span>
                  <span className="text-[color:var(--color-muted)]">
                    · {rows.length}
                  </span>
                  <span className="ml-auto text-[color:var(--color-muted)]">
                    {g === "expired" &&
                      "ACTION REQUIRED · BRING OFFICER OFF-DUTY"}
                    {g === "expiring" && "SCHEDULE RENEWAL ≤ 30D"}
                    {g === "compliant" && "NO ACTION"}
                  </span>
                </div>
                <div>
                  {rows.map((o) => (
                    <OfficerRow
                      key={o.id}
                      officer={o}
                      now={now}
                      onSelect={setSelectedId}
                      selected={selectedId === o.id}
                    />
                  ))}
                </div>
              </section>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-[11px] uppercase tracking-wider text-[color:var(--color-muted)]">
              NO OFFICERS MATCH QUERY
            </div>
          )}
        </div>

        <aside className="border-t border-[color:var(--color-line)] bg-[color:var(--color-panel)] lg:border-l lg:border-t-0">
          <div className="border-b border-[color:var(--color-line)] px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-fg-strong)]">
            ACTIVITY FEED
          </div>
          <ul className="divide-y divide-[color:var(--color-line)]">
            {audit.slice(0, 20).map((a) => (
              <li
                key={a.id}
                className="flex items-start gap-2 px-4 py-2 text-[11px]"
              >
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 bg-[color:var(--color-accent)]" />
                <div className="min-w-0">
                  <div className="uppercase tracking-wider text-[color:var(--color-dim)]">
                    {new Date(a.timestamp).toLocaleTimeString("en-US", {
                      hour12: false,
                    })}{" "}
                    · {a.actor}
                  </div>
                  <div className="truncate text-[color:var(--color-fg)]">
                    <span className="text-[color:var(--color-fg-strong)]">
                      {a.action}
                    </span>{" "}
                    {a.target}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <SidePanel
        officerId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
