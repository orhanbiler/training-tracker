"use client";

import { useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { cn, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";

export default function FilesPage() {
  const { files, officers, logAudit } = useStore();
  const [officerId, setOfficerId] = useState<string>(officers[0]?.id ?? "");
  const [certId, setCertId] = useState<string>("");
  const [localFiles, setLocalFiles] = useState(files);
  const fileInput = useRef<HTMLInputElement>(null);

  const currentOfficer = officers.find((o) => o.id === officerId);
  const officerCerts = currentOfficer?.certifications ?? [];
  const defaultCertId = officerCerts[0]?.id ?? "";
  const activeCertId = certId || defaultCertId;

  const officerFiles = useMemo(
    () => localFiles.filter((f) => f.officerId === officerId),
    [localFiles, officerId],
  );

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !officerId || !activeCertId) return;
    const entry = {
      id: `f-${Date.now()}`,
      name: f.name,
      size: f.size,
      uploadedAt: new Date().toISOString(),
      officerId,
      certificationId: activeCertId,
    };
    setLocalFiles((prev) => [entry, ...prev]);
    logAudit({
      actor: "admin",
      action: "uploaded",
      target: `${officerId} / ${f.name}`,
    });
    if (fileInput.current) fileInput.current.value = "";
  };

  return (
    <>
      <PageHeader
        title="CERTIFICATION FILES"
        subtitle={`${localFiles.length} attached documents`}
      />
      <div className="grid grid-cols-1 border-b border-[color:var(--color-line)] lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b border-[color:var(--color-line)] lg:border-b-0 lg:border-r">
          <div className="border-b border-[color:var(--color-line)] px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-dim)]">
            OFFICERS
          </div>
          <ul>
            {officers.map((o) => (
              <li key={o.id}>
                <button
                  onClick={() => {
                    setOfficerId(o.id);
                    setCertId("");
                  }}
                  className={cn(
                    "flex w-full items-center justify-between border-b border-[color:var(--color-line)] px-4 py-1.5 text-left text-[12px] hover:bg-[color:var(--color-panel)]",
                    o.id === officerId && "bg-[color:var(--color-panel-2)]",
                  )}
                >
                  <span className="text-[color:var(--color-fg-strong)]">
                    {o.name}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
                    #{o.badge}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section>
          <div className="flex flex-wrap items-center gap-2 border-b border-[color:var(--color-line)] bg-[color:var(--color-panel)] px-4 py-2 text-[10px] uppercase tracking-wider">
            <span className="text-[color:var(--color-dim)]">CERT</span>
            {officerCerts.map((c) => (
              <button
                key={c.id}
                onClick={() => setCertId(c.id)}
                className={cn(
                  "border px-2 py-1",
                  c.id === activeCertId
                    ? "border-[color:var(--color-fg-strong)] text-[color:var(--color-fg-strong)]"
                    : "border-[color:var(--color-line-strong)] text-[color:var(--color-dim)]",
                )}
              >
                {c.code}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <input
                ref={fileInput}
                type="file"
                onChange={handleUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel-2)] px-2 py-1 hover:border-[color:var(--color-fg)] hover:text-[color:var(--color-fg-strong)]"
              >
                + ATTACH FILE
              </label>
            </div>
          </div>

          {officerFiles.length === 0 ? (
            <div className="px-4 py-10 text-center text-[11px] uppercase tracking-wider text-[color:var(--color-muted)]">
              NO FILES ATTACHED
            </div>
          ) : (
            <ul>
              {officerFiles.map((f) => {
                const cert = officerCerts.find(
                  (c) => c.id === f.certificationId,
                );
                return (
                  <li
                    key={f.id}
                    className="grid grid-cols-[1fr_90px_110px_140px] items-center gap-4 border-b border-[color:var(--color-line)] px-4 py-2 text-[12px] hover:bg-[color:var(--color-panel)]"
                  >
                    <span className="truncate text-[color:var(--color-fg-strong)]">
                      {f.name}
                    </span>
                    <span className="text-[11px] uppercase tracking-wider text-[color:var(--color-dim)]">
                      {cert?.code ?? "—"}
                    </span>
                    <span className="tabular-nums text-[color:var(--color-muted)]">
                      {(f.size / 1024).toFixed(0)} KB
                    </span>
                    <span className="text-[11px] uppercase tracking-wider text-[color:var(--color-muted)]">
                      {formatDate(new Date(f.uploadedAt))}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
