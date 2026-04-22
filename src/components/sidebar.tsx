"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Award,
  Calendar,
  FolderOpen,
  LayoutGrid,
  LogOut,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { getCertDaysRemaining, getCertStatus } from "@/lib/status";
import { Logo } from "@/components/logo";

const NAV = [
  { href: "/", label: "OVERVIEW", icon: LayoutGrid },
  { href: "/grid", label: "CERTIFICATIONS", icon: Award },
  { href: "/training", label: "TRAINING", icon: Calendar },
  { href: "/expirations", label: "EXPIRATIONS", icon: Timer },
  { href: "/files", label: "FILES", icon: FolderOpen },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { officers, now } = useStore();
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  let expired = 0;
  let soon30 = 0;
  let soon60 = 0;
  let compliant = 0;
  for (const o of officers) {
    for (const c of o.certifications) {
      const s = getCertStatus(c, now);
      const d = getCertDaysRemaining(c, now);
      if (s === "expired") expired++;
      else if (d <= 30) soon30++;
      else if (d <= 60) soon60++;
      else compliant++;
    }
  }

  const FILTERS: Array<{ label: string; value: number; color: string }> = [
    {
      label: "EXPIRING ≤ 30 DAYS",
      value: soon30,
      color: "var(--color-warn)",
    },
    {
      label: "EXPIRING 31–60 DAYS",
      value: soon60,
      color: "var(--color-warn)",
    },
    { label: "EXPIRED", value: expired, color: "var(--color-danger)" },
    { label: "COMPLIANT", value: compliant, color: "var(--color-ok)" },
  ];

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      router.replace("/login");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[220px] shrink-0 flex-col border-r border-[color:var(--color-line)] bg-[color:var(--color-panel)]">
      <div className="flex items-center gap-3 border-b border-[color:var(--color-line)] px-4 py-4">
        <Logo size={36} className="shrink-0" />
        <div className="min-w-0">
          <div className="truncate text-[12px] font-semibold tracking-wider text-[color:var(--color-fg-strong)]">
            CHEVERLY PD
          </div>
          <div className="truncate text-[9px] uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
            TRAINING COMMAND
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2 text-[11px] uppercase tracking-[0.12em]",
                    active
                      ? "bg-[color:var(--color-panel-2)] text-[color:var(--color-fg-strong)]"
                      : "text-[color:var(--color-dim)] hover:bg-[color:var(--color-panel-2)]/60 hover:text-[color:var(--color-fg)]",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 border border-[color:var(--color-line)] p-3">
          <div className="mb-2 text-[9px] uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
            QUICK FILTERS
          </div>
          <ul className="flex flex-col gap-1.5">
            {FILTERS.map((f) => (
              <li
                key={f.label}
                className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider"
              >
                <span className="flex min-w-0 items-center gap-2 text-[color:var(--color-fg)]">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: f.color }}
                  />
                  <span className="truncate">{f.label}</span>
                </span>
                <span className="tabular-nums text-[color:var(--color-fg-strong)]">
                  {f.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="border-t border-[color:var(--color-line)]">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel-2)] text-[10px] uppercase tracking-wider text-[color:var(--color-fg-strong)]">
            {user?.initials ?? "??"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] uppercase tracking-wider text-[color:var(--color-fg-strong)]">
              {user?.displayName ?? "—"}
            </div>
            <div className="truncate text-[9px] uppercase tracking-wider text-[color:var(--color-muted)]">
              {user?.role ?? "viewer"} · {user?.email ?? ""}
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center justify-center gap-2 border-t border-[color:var(--color-line)] px-4 py-2 text-[10px] uppercase tracking-wider text-[color:var(--color-dim)] hover:bg-[color:var(--color-panel-2)] hover:text-[color:var(--color-fg-strong)] disabled:opacity-50"
        >
          <LogOut className="h-3 w-3" />
          SIGN OUT
        </button>
      </div>
    </aside>
  );
}
