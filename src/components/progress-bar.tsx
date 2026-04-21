import { cn } from "@/lib/utils";
import type { CertStatus } from "@/lib/types";

const COLORS: Record<CertStatus, string> = {
  compliant: "bg-[color:var(--color-ok)]",
  expiring: "bg-[color:var(--color-warn)]",
  expired: "bg-[color:var(--color-danger)]",
};

export function ProgressBar({
  value,
  status,
  className,
}: {
  /** 0..1 portion filled (remaining life). */
  value: number;
  status: CertStatus;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className={cn(
        "relative h-[3px] w-full bg-[color:var(--color-line)]",
        className,
      )}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("absolute inset-y-0 left-0", COLORS[status])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
