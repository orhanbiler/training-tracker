import { cn } from "@/lib/utils";
import type { CertStatus } from "@/lib/types";

const STYLES: Record<CertStatus, string> = {
  compliant: "text-[color:var(--color-ok)] border-[color:var(--color-ok)]/40",
  expiring:
    "text-[color:var(--color-warn)] border-[color:var(--color-warn)]/40",
  expired:
    "text-[color:var(--color-danger)] border-[color:var(--color-danger)]/50",
};

const LABELS: Record<CertStatus, string> = {
  compliant: "OK",
  expiring: "SOON",
  expired: "EXP",
};

export function StatusTag({
  status,
  pulse,
  size = "sm",
  label,
  className,
}: {
  status: CertStatus;
  pulse?: boolean;
  size?: "xs" | "sm";
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border px-1.5 uppercase tracking-wider tabular-nums",
        size === "xs" ? "text-[10px] leading-4" : "text-[11px] leading-5",
        STYLES[status],
        pulse && status === "expired" && "urgent-glow",
        className,
      )}
    >
      <span
        className={cn(
          "inline-block h-1.5 w-1.5",
          status === "compliant" && "bg-[color:var(--color-ok)]",
          status === "expiring" && "bg-[color:var(--color-warn)]",
          status === "expired" && "bg-[color:var(--color-danger)]",
        )}
      />
      {label ?? LABELS[status]}
    </span>
  );
}
