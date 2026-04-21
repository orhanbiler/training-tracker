import { HeatmapGrid } from "@/components/heatmap-grid";
import { PageHeader } from "@/components/page-header";

export default function GridPage() {
  return (
    <>
      <PageHeader
        title="CERTIFICATION MATRIX"
        subtitle="Heatmap view — rows are officers, columns are certifications"
      />
      <div className="px-6 py-5">
        <div className="border border-[color:var(--color-line)] bg-[color:var(--color-panel)]">
          <HeatmapGrid />
        </div>
      </div>
    </>
  );
}
