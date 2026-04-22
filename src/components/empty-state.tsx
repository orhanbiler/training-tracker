"use client";

import { useState } from "react";
import { Database, Loader2, Plus } from "lucide-react";
import { seedDemoData } from "@/lib/seed";
import { cn } from "@/lib/utils";

export function EmptyState({
  onAddOfficer,
}: {
  onAddOfficer?: () => void;
}) {
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSeed() {
    setError(null);
    setSeeding(true);
    try {
      await seedDemoData();
    } catch (e) {
      setError((e as Error)?.message ?? "SEED FAILED");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="mx-auto mt-12 max-w-[520px] border border-[color:var(--color-line)] bg-[color:var(--color-panel)] p-8 text-center fade-in">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel-2)]">
        <Database className="h-5 w-5 text-[color:var(--color-fg-strong)]" />
      </div>
      <div className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-fg-strong)]">
        NO DATA YET
      </div>
      <p className="mt-2 text-[11px] uppercase tracking-wider text-[color:var(--color-dim)]">
        Your Firestore is empty. Add an officer to begin tracking, or load a
        demo dataset to see the system in action.
      </p>

      <div className="mt-5 flex flex-col gap-2">
        {onAddOfficer && (
          <button
            onClick={onAddOfficer}
            className={cn(
              "flex items-center justify-center gap-2 border border-[color:var(--color-fg-strong)] bg-[color:var(--color-fg-strong)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-bg)]",
              "hover:bg-[color:var(--color-accent)] hover:border-[color:var(--color-accent)]",
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            ADD FIRST OFFICER
          </button>
        )}
        <button
          onClick={handleSeed}
          disabled={seeding}
          className={cn(
            "flex items-center justify-center gap-2 border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel-2)] px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-fg)]",
            "hover:border-[color:var(--color-fg)] hover:text-[color:var(--color-fg-strong)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {seeding ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Database className="h-3.5 w-3.5" />
          )}
          LOAD DEMO DATASET
        </button>
      </div>

      {error && (
        <div className="mt-3 border border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/10 px-3 py-2 text-[10px] uppercase tracking-wider text-[color:var(--color-danger)]">
          {error}
        </div>
      )}
    </div>
  );
}
