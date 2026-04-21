import { HeatmapGrid } from "@/components/heatmap-grid";

export default function GridPage() {
  return (
    <div>
      <div className="flex items-center justify-between border-b border-[color:var(--color-line)] bg-[color:var(--color-panel)]/60 px-4 py-2 text-[11px] uppercase tracking-[0.12em]">
        <div className="flex items-center gap-3">
          <span className="text-[color:var(--color-fg-strong)]">
            CERTIFICATION MATRIX
          </span>
          <span className="text-[color:var(--color-muted)]">
            HEATMAP VIEW · ROWS = OFFICERS · COLUMNS = CERTS
          </span>
        </div>
      </div>
      <HeatmapGrid />
    </div>
  );
}
