"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { useStore } from "@/lib/store";

export function StoreErrorBanner() {
  const { error } = useStore();
  const pathname = usePathname();

  if (!error) return null;
  // The main page already shows the full error panel inline, so skip the
  // banner there to avoid duplication.
  if (pathname === "/") return null;

  const label =
    error.kind === "permission-denied"
      ? "FIRESTORE ACCESS DENIED"
      : error.kind === "unavailable"
      ? "FIRESTORE UNAVAILABLE"
      : "FIRESTORE ERROR";

  return (
    <div className="flex items-center gap-3 border-b border-[color:var(--color-danger)]/50 bg-[color:var(--color-danger)]/10 px-6 py-2 text-[11px] uppercase tracking-wider text-[color:var(--color-danger)]">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      <span className="font-semibold">{label}</span>
      <span className="text-[color:var(--color-dim)]">· {error.message}</span>
      <Link
        href="/"
        className="ml-auto border border-[color:var(--color-danger)]/50 px-2 py-0.5 text-[color:var(--color-danger)] hover:border-[color:var(--color-danger)] hover:text-[color:var(--color-fg-strong)]"
      >
        VIEW FIX →
      </Link>
    </div>
  );
}
