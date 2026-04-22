"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { getOfficerStatus } from "@/lib/status";
import { cn } from "@/lib/utils";
import { ExpirationTimeline } from "@/components/expiration-timeline";
import { OfficerRow } from "@/components/officer-row";
import { PageHeader } from "@/components/page-header";
import { SidePanel } from "@/components/side-panel";
import { EmptyState } from "@/components/empty-state";
import { AddOfficerDialog } from "@/components/add-officer-dialog";
import { FirestoreErrorPanel } from "@/components/firestore-error-panel";
import type { CertStatus, Officer } from "@/lib/types";

const PREVIEW_COUNT = 3;

export default function Page() {
  const { officers, now, loading, isEmpty, error } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<CertStatus, boolean>>({
    expired: false,
    expiring: false,
    compliant: false,
  });

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
      <PageHeader
        title="COMMAND CENTER"
        subtitle="Cheverly PD — real-time certification status and training readiness"
        query={query}
        onQueryChange={setQuery}
        onAdd={() => setAddOpen(true)}
        addLabel="ADD OFFICER"
      />

      {error ? (
        <div className="px-6">
          <FirestoreErrorPanel error={error} />
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-dim)]">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          LOADING ROSTER
        </div>
      ) : isEmpty ? (
        <EmptyState onAddOfficer={() => setAddOpen(true)} />
      ) : (
        <>
      <div className="px-6 pt-5">
        <ExpirationTimeline officers={filtered} now={now} />
      </div>

      <div className="px-6 pt-4">
        <Section
          icon={<AlertCircle className="h-4 w-4" />}
          label="EXPIRED"
          accent="danger"
          officers={groups.expired}
          expanded={expanded.expired}
          onToggle={() =>
            setExpanded((e) => ({ ...e, expired: !e.expired }))
          }
          variant="expired"
          onSelect={setSelectedId}
          selectedId={selectedId}
        />
        <Section
          icon={<Clock className="h-4 w-4" />}
          label="EXPIRING SOON"
          accent="warn"
          officers={groups.expiring}
          expanded={expanded.expiring}
          onToggle={() =>
            setExpanded((e) => ({ ...e, expiring: !e.expiring }))
          }
          variant="soon"
          onSelect={setSelectedId}
          selectedId={selectedId}
        />
        <Section
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="COMPLIANT"
          accent="ok"
          officers={groups.compliant}
          expanded={expanded.compliant}
          onToggle={() =>
            setExpanded((e) => ({ ...e, compliant: !e.compliant }))
          }
          variant="compliant"
          onSelect={setSelectedId}
          selectedId={selectedId}
        />
        {filtered.length === 0 && (
          <div className="mt-10 text-center text-[11px] uppercase tracking-wider text-[color:var(--color-muted)]">
            NO OFFICERS MATCH QUERY
          </div>
        )}
      </div>
        </>
      )}

      <SidePanel
        officerId={selectedId}
        onClose={() => setSelectedId(null)}
      />
      <AddOfficerDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}

const ACCENT_COLOR: Record<"danger" | "warn" | "ok", string> = {
  danger: "var(--color-danger)",
  warn: "var(--color-warn)",
  ok: "var(--color-ok)",
};

function Section({
  icon,
  label,
  accent,
  officers,
  expanded,
  onToggle,
  variant,
  onSelect,
  selectedId,
}: {
  icon: React.ReactNode;
  label: string;
  accent: "danger" | "warn" | "ok";
  officers: Officer[];
  expanded: boolean;
  onToggle: () => void;
  variant: "expired" | "soon" | "compliant";
  onSelect: (id: string) => void;
  selectedId: string | null;
}) {
  if (officers.length === 0) return null;

  const visible = expanded ? officers : officers.slice(0, PREVIEW_COUNT);
  const remaining = officers.length - visible.length;

  return (
    <section className="mt-5">
      <div className="flex items-center gap-2 pb-2">
        <span style={{ color: ACCENT_COLOR[accent] }}>{icon}</span>
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: ACCENT_COLOR[accent] }}
        >
          {label}
        </span>
        <span
          className="text-[11px] tabular-nums"
          style={{ color: ACCENT_COLOR[accent] }}
        >
          ({officers.length})
        </span>
      </div>

      <div className="border border-[color:var(--color-line)] bg-[color:var(--color-panel)]">
        <ColumnHeader variant={variant} />
        {visible.map((o) => (
          <OfficerRow
            key={o.id}
            officer={o}
            now={new Date()}
            onSelect={onSelect}
            selected={selectedId === o.id}
            variant={variant}
          />
        ))}
        {remaining > 0 && (
          <button
            onClick={onToggle}
            className={cn(
              "flex w-full items-center justify-center gap-1.5 border-t border-[color:var(--color-line)] bg-[color:var(--color-panel-2)]/50 py-2 text-[10px] uppercase tracking-wider text-[color:var(--color-dim)] hover:text-[color:var(--color-fg-strong)]",
            )}
          >
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform",
                expanded && "rotate-180",
              )}
            />
            + {remaining} MORE
          </button>
        )}
        {expanded && officers.length > PREVIEW_COUNT && (
          <button
            onClick={onToggle}
            className="flex w-full items-center justify-center gap-1.5 border-t border-[color:var(--color-line)] bg-[color:var(--color-panel-2)]/50 py-2 text-[10px] uppercase tracking-wider text-[color:var(--color-dim)] hover:text-[color:var(--color-fg-strong)]"
          >
            <ChevronDown className="h-3 w-3 rotate-180" />
            COLLAPSE
          </button>
        )}
      </div>
    </section>
  );
}

function ColumnHeader({ variant }: { variant: "expired" | "soon" | "compliant" }) {
  return (
    <div
      className={cn(
        "grid items-center gap-4 border-b border-[color:var(--color-line)] bg-[color:var(--color-panel-2)]/60 px-5 py-2 text-[9px] uppercase tracking-[0.16em] text-[color:var(--color-muted)]",
        variant === "expired"
          ? "grid-cols-[minmax(0,220px)_80px_minmax(0,1fr)_160px_120px]"
          : "grid-cols-[minmax(0,220px)_80px_minmax(0,1fr)_140px_60px_140px]",
      )}
    >
      <span>OFFICER</span>
      <span>BADGE</span>
      <span>CERTIFICATIONS</span>
      <span className="text-right">
        {variant === "expired" ? "EXPIRED" : "NEXT EXPIRATION"}
      </span>
      {variant !== "expired" && <span className="text-right">DAYS LEFT</span>}
      <span className="text-right">ACTIONS</span>
    </div>
  );
}
