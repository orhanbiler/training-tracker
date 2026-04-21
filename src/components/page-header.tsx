"use client";

import { Bell, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  query,
  onQueryChange,
  right,
}: {
  title: string;
  subtitle?: string;
  query?: string;
  onQueryChange?: (q: string) => void;
  right?: React.ReactNode;
}) {
  const searchable = typeof onQueryChange === "function";

  return (
    <header className="flex items-center gap-4 border-b border-[color:var(--color-line)] bg-[color:var(--color-bg)] px-6 py-4">
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-fg-strong)]">
          {title}
        </div>
        {subtitle && (
          <div className="mt-0.5 text-[11px] text-[color:var(--color-dim)]">
            {subtitle}
          </div>
        )}
      </div>

      {searchable && (
        <div className="relative flex w-full max-w-md items-center">
          <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-[color:var(--color-muted)]" />
          <input
            value={query ?? ""}
            onChange={(e) => onQueryChange?.(e.target.value)}
            placeholder="Search officer, certification, or training..."
            className={cn(
              "w-full border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel)] py-2 pl-9 pr-10 text-[12px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-muted)]",
              "focus:border-[color:var(--color-accent)] focus:outline-none",
            )}
          />
          <span className="pointer-events-none absolute right-2 border border-[color:var(--color-line-strong)] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
            /
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {right}
        <button className="flex items-center gap-2 border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel)] px-3 py-1.5 text-[11px] uppercase tracking-wider hover:border-[color:var(--color-fg)] hover:text-[color:var(--color-fg-strong)]">
          <Plus className="h-3.5 w-3.5" />
          ADD
        </button>
        <button className="relative flex h-8 w-8 items-center justify-center border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel)] hover:border-[color:var(--color-fg)]">
          <Bell className="h-3.5 w-3.5 text-[color:var(--color-fg)]" />
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--color-danger)] px-1 text-[9px] font-semibold text-[color:var(--color-fg-strong)]">
            3
          </span>
        </button>
      </div>
    </header>
  );
}
