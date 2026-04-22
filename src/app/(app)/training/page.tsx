"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { cn, daysBetween, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";

export default function TrainingPage() {
  const { training, officers, now, assignToTraining } = useStore();
  const [openId, setOpenId] = useState<string | null>(training[0]?.id ?? null);
  const [codeFilter, setCodeFilter] = useState<string>("");

  const codes = useMemo(
    () => Array.from(new Set(training.map((t) => t.code))),
    [training],
  );

  const sessions = useMemo(() => {
    const rows = [...training].sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    return codeFilter ? rows.filter((t) => t.code === codeFilter) : rows;
  }, [training, codeFilter]);

  const openSession = sessions.find((t) => t.id === openId) ?? null;
  const openAssigned = openSession
    ? officers.filter((o) => openSession.assignedOfficerIds.includes(o.id))
    : [];
  const openCandidates = openSession
    ? officers.filter((o) => !openSession.assignedOfficerIds.includes(o.id))
    : [];

  return (
    <>
      <PageHeader
        title="TRAINING SCHEDULE"
        subtitle={`${sessions.length} upcoming sessions — click to assign officers`}
      />
      <div className="px-6 py-5">
        <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-wider">
          <span className="text-[color:var(--color-muted)]">FILTER</span>
          <button
            onClick={() => setCodeFilter("")}
            className={cn(
              "border px-2 py-1",
              codeFilter === ""
                ? "border-[color:var(--color-fg-strong)] text-[color:var(--color-fg-strong)]"
                : "border-[color:var(--color-line-strong)] text-[color:var(--color-dim)]",
            )}
          >
            ALL
          </button>
          {codes.map((c) => (
            <button
              key={c}
              onClick={() => setCodeFilter(c)}
              className={cn(
                "border px-2 py-1",
                codeFilter === c
                  ? "border-[color:var(--color-fg-strong)] text-[color:var(--color-fg-strong)]"
                  : "border-[color:var(--color-line-strong)] text-[color:var(--color-dim)]",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 border border-[color:var(--color-line)] bg-[color:var(--color-panel)] lg:grid-cols-[minmax(0,1fr)_380px]">
        <ul>
          {sessions.map((t) => {
            const d = new Date(t.date);
            const daysOut = daysBetween(now, d);
            const pct =
              (t.assignedOfficerIds.length / Math.max(1, t.capacity)) * 100;
            const selected = t.id === openId;
            return (
              <li
                key={t.id}
                onClick={() => setOpenId(t.id)}
                className={cn(
                  "grid cursor-pointer grid-cols-[60px_70px_1fr_160px_140px_90px] items-center gap-4 border-b border-[color:var(--color-line)] px-4 py-2 text-[12px] hover:bg-[color:var(--color-panel)]",
                  selected && "bg-[color:var(--color-panel-2)]",
                )}
              >
                <span className="text-[11px] uppercase tracking-wider text-[color:var(--color-fg-strong)]">
                  {t.code}
                </span>
                <span className="tabular-nums text-[color:var(--color-accent)]">
                  T{daysOut >= 0 ? `+${daysOut}` : daysOut}D
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[color:var(--color-fg-strong)]">
                    {t.title}
                  </div>
                  <div className="truncate text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
                    {formatDate(d)} · {t.location} · {t.instructor}
                  </div>
                </div>
                <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-dim)]">
                  {t.durationHours}H · {t.location}
                </div>
                <div>
                  <div className="flex justify-between text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
                    <span>CAPACITY</span>
                    <span>
                      {t.assignedOfficerIds.length}/{t.capacity}
                    </span>
                  </div>
                  <div className="mt-1 h-[3px] w-full bg-[color:var(--color-line)]">
                    <div
                      className="h-full bg-[color:var(--color-accent)]"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
                <span className="text-right text-[11px] uppercase tracking-wider text-[color:var(--color-dim)]">
                  {selected ? "OPEN ▸" : "DETAILS"}
                </span>
              </li>
            );
          })}
        </ul>

        <aside className="border-t border-[color:var(--color-line)] bg-[color:var(--color-panel)] lg:border-l lg:border-t-0">
          {openSession ? (
            <div>
              <div className="border-b border-[color:var(--color-line)] px-4 py-2 text-[11px] uppercase tracking-[0.14em]">
                <div className="text-[color:var(--color-fg-strong)]">
                  {openSession.title}
                </div>
                <div className="text-[color:var(--color-muted)]">
                  {openSession.code} ·{" "}
                  {formatDate(new Date(openSession.date))} ·{" "}
                  {openSession.durationHours}H
                </div>
              </div>
              <section className="px-4 py-3">
                <SectionHeader
                  label="ASSIGNED"
                  count={openAssigned.length}
                />
                {openAssigned.length === 0 ? (
                  <div className="mt-2 border border-dashed border-[color:var(--color-line)] px-3 py-3 text-center text-[11px] uppercase tracking-wider text-[color:var(--color-muted)]">
                    NO OFFICERS ASSIGNED
                  </div>
                ) : (
                  <ul className="mt-2 border border-[color:var(--color-line)]">
                    {openAssigned.map((o) => (
                      <li
                        key={o.id}
                        className="flex items-center justify-between border-b border-[color:var(--color-line)] px-3 py-1.5 text-[11px] last:border-b-0"
                      >
                        <span className="text-[color:var(--color-fg)]">
                          {o.name}{" "}
                          <span className="text-[color:var(--color-muted)]">
                            #{o.badge}
                          </span>
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
                          {o.rank} · {o.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="px-4 py-3">
                <SectionHeader label="ROSTER" count={openCandidates.length} />
                <ul className="mt-2 border border-[color:var(--color-line)]">
                  {openCandidates.map((o) => (
                    <li
                      key={o.id}
                      className="flex items-center justify-between border-b border-[color:var(--color-line)] px-3 py-1.5 text-[11px] last:border-b-0"
                    >
                      <span className="text-[color:var(--color-fg)]">
                        {o.name}{" "}
                        <span className="text-[color:var(--color-muted)]">
                          #{o.badge}
                        </span>
                      </span>
                      <button
                        onClick={() =>
                          assignToTraining(openSession.id, o.id)
                        }
                        className="border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel-2)] px-2 py-0.5 text-[10px] uppercase tracking-wider hover:border-[color:var(--color-fg)] hover:text-[color:var(--color-fg-strong)]"
                      >
                        ASSIGN
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          ) : (
            <div className="px-4 py-10 text-center text-[11px] uppercase tracking-wider text-[color:var(--color-muted)]">
              SELECT A SESSION
            </div>
          )}
        </aside>
        </div>
      </div>
    </>
  );
}

function SectionHeader({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-baseline justify-between border-b border-[color:var(--color-line)] pb-1 text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-dim)]">
      <span>{label}</span>
      {typeof count === "number" && (
        <span className="text-[color:var(--color-muted)]">
          {count.toString().padStart(2, "0")}
        </span>
      )}
    </div>
  );
}
