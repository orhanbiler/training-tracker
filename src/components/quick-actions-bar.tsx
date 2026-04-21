"use client";

import Link from "next/link";
import {
  BarChart3,
  Send,
  MoreHorizontal,
  Upload,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function QuickActionsBar() {
  return (
    <div className="sticky bottom-0 z-20 flex items-center gap-2 border-t border-[color:var(--color-line)] bg-[color:var(--color-panel)] px-5 py-2 text-[10px] uppercase tracking-wider">
      <span className="flex items-center gap-2 pr-3 text-[color:var(--color-dim)]">
        QUICK ACTIONS
        <span className="border border-[color:var(--color-line-strong)] px-1.5 py-0.5 text-[9px] text-[color:var(--color-muted)]">
          ⌘ K
        </span>
      </span>
      <ActionLink href="/training" icon={<UserPlus className="h-3.5 w-3.5" />}>
        ASSIGN TRAINING
      </ActionLink>
      <ActionLink
        href="/expirations"
        icon={<Send className="h-3.5 w-3.5" />}
      >
        BULK NOTIFY
      </ActionLink>
      <ActionLink href="/files" icon={<Upload className="h-3.5 w-3.5" />}>
        UPLOAD CERTS
      </ActionLink>
      <ActionLink
        href="/grid"
        icon={<BarChart3 className="h-3.5 w-3.5" />}
      >
        RUN COMPLIANCE REPORT
      </ActionLink>
      <button
        className={cn(
          "ml-auto flex h-7 w-7 items-center justify-center border border-[color:var(--color-line-strong)]",
          "text-[color:var(--color-dim)] hover:border-[color:var(--color-fg)] hover:text-[color:var(--color-fg-strong)]",
        )}
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function ActionLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 border border-transparent px-2 py-1.5 text-[color:var(--color-fg)] hover:border-[color:var(--color-line-strong)] hover:bg-[color:var(--color-panel-2)]"
    >
      {icon}
      {children}
    </Link>
  );
}
