"use client";

import { useMemo, useRef, useState } from "react";
import {
  Download,
  FileIcon,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useStore, type UploadProgress } from "@/lib/store";
import { cn, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import type { AttachedFile } from "@/lib/types";

const MAX_SIZE = 25 * 1024 * 1024; // 25 MB
const ACCEPT =
  ".pdf,.jpg,.jpeg,.png,.gif,.heic,.webp,.doc,.docx,.xls,.xlsx,image/*,application/pdf";

export default function FilesPage() {
  const { files, officers, attachFile, deleteFile } = useStore();
  const [selectedOfficerId, setSelectedOfficerId] = useState<string | null>(
    null,
  );
  const [certId, setCertId] = useState<string>("");
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [uploadingName, setUploadingName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const officerId = selectedOfficerId ?? officers[0]?.id ?? "";
  const currentOfficer = officers.find((o) => o.id === officerId);
  const officerCerts = currentOfficer?.certifications ?? [];
  // certId is optional — empty string means "no cert association" ("GENERAL").
  const activeCertId = certId;

  const officerFiles = useMemo(
    () =>
      files
        .filter((f) => f.officerId === officerId)
        .sort((a, b) => (b.uploadedAt ?? "").localeCompare(a.uploadedAt ?? "")),
    [files, officerId],
  );

  async function doUpload(file: File) {
    if (!officerId) {
      setError("SELECT AN OFFICER FIRST");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(`FILE TOO LARGE — MAX ${(MAX_SIZE / 1024 / 1024).toFixed(0)}MB`);
      return;
    }
    setError(null);
    setUploadingName(file.name);
    setProgress({ progress: 0, bytesTransferred: 0, totalBytes: file.size });
    try {
      await attachFile({
        file,
        officerId,
        certificationId: activeCertId || undefined,
        onProgress: setProgress,
      });
    } catch (e) {
      setError(friendlyStorageError(e));
    } finally {
      setUploadingName(null);
      setProgress(null);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) await doUpload(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void doUpload(f);
  }

  async function handleDelete(file: AttachedFile) {
    if (!confirm(`Delete ${file.name}? This cannot be undone.`)) return;
    setDeleting(file.id);
    setError(null);
    try {
      await deleteFile(file);
    } catch (e) {
      setError(friendlyStorageError(e));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <PageHeader
        title="CERTIFICATION FILES"
        subtitle={`${files.length} attached documents across ${officers.length} officers`}
      />

      <div className="grid grid-cols-1 border-b border-[color:var(--color-line)] lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b border-[color:var(--color-line)] lg:border-b-0 lg:border-r">
          <div className="border-b border-[color:var(--color-line)] px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-dim)]">
            OFFICERS
          </div>
          <ul>
            {officers.map((o) => {
              const count = files.filter((f) => f.officerId === o.id).length;
              return (
                <li key={o.id}>
                  <button
                    onClick={() => {
                      setSelectedOfficerId(o.id);
                      setCertId("");
                      setError(null);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between border-b border-[color:var(--color-line)] px-4 py-1.5 text-left text-[12px] hover:bg-[color:var(--color-panel)]",
                      o.id === officerId && "bg-[color:var(--color-panel-2)]",
                    )}
                  >
                    <span className="truncate text-[color:var(--color-fg-strong)]">
                      {o.name}
                    </span>
                    <span className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
                      <span>#{o.badge}</span>
                      {count > 0 && (
                        <span className="tabular-nums text-[color:var(--color-accent)]">
                          {count}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
            {officers.length === 0 && (
              <li className="px-4 py-6 text-center text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
                NO OFFICERS YET
              </li>
            )}
          </ul>
        </aside>

        <section
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={cn(
            "relative",
            dragActive && "bg-[color:var(--color-accent)]/5",
          )}
        >
          <div className="flex flex-wrap items-center gap-2 border-b border-[color:var(--color-line)] bg-[color:var(--color-panel)] px-4 py-2 text-[10px] uppercase tracking-wider">
            <span className="text-[color:var(--color-dim)]">CERT</span>
            <button
              onClick={() => setCertId("")}
              className={cn(
                "border px-2 py-1",
                activeCertId === ""
                  ? "border-[color:var(--color-fg-strong)] text-[color:var(--color-fg-strong)]"
                  : "border-[color:var(--color-line-strong)] text-[color:var(--color-dim)]",
              )}
              title="No specific certification — file attaches to officer only"
            >
              GENERAL
            </button>
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
                title={c.name}
              >
                {c.code}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <input
                ref={fileInput}
                type="file"
                accept={ACCEPT}
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel-2)] px-2 py-1 hover:border-[color:var(--color-fg)] hover:text-[color:var(--color-fg-strong)]",
                  !officerId && "pointer-events-none opacity-40",
                )}
              >
                <Upload className="h-3 w-3" />
                ATTACH FILE
              </label>
            </div>
          </div>

          {uploadingName && progress && (
            <UploadingRow
              name={uploadingName}
              progress={progress}
            />
          )}

          {error && (
            <div className="border-b border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/10 px-4 py-2 text-[11px] uppercase tracking-wider text-[color:var(--color-danger)]">
              {error}
              <button
                onClick={() => setError(null)}
                className="float-right text-[color:var(--color-danger)] hover:text-[color:var(--color-fg-strong)]"
                aria-label="dismiss"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {!currentOfficer ? (
            <div className="px-4 py-10 text-center text-[11px] uppercase tracking-wider text-[color:var(--color-muted)]">
              SELECT AN OFFICER TO VIEW FILES
            </div>
          ) : officerFiles.length === 0 ? (
            <DropZone />
          ) : (
            <ul>
              {officerFiles.map((f) => {
                const cert = officerCerts.find(
                  (c) => c.id === f.certificationId,
                );
                return (
                  <li
                    key={f.id}
                    className="grid grid-cols-[20px_minmax(0,1fr)_90px_110px_140px_80px] items-center gap-4 border-b border-[color:var(--color-line)] px-4 py-2 text-[12px] hover:bg-[color:var(--color-panel)]"
                  >
                    <FileIcon className="h-3.5 w-3.5 text-[color:var(--color-dim)]" />
                    <div className="min-w-0">
                      {f.downloadURL ? (
                        <a
                          href={f.downloadURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block truncate text-[color:var(--color-fg-strong)] hover:text-[color:var(--color-accent)]"
                          title={f.name}
                        >
                          {f.name}
                        </a>
                      ) : (
                        <span className="block truncate text-[color:var(--color-fg-strong)]">
                          {f.name}
                        </span>
                      )}
                      {f.contentType && (
                        <div className="truncate text-[9px] uppercase tracking-wider text-[color:var(--color-muted)]">
                          {f.contentType}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] uppercase tracking-wider text-[color:var(--color-dim)]">
                      {cert?.code ?? (f.certificationId ? "—" : "GENERAL")}
                    </span>
                    <span className="tabular-nums text-[color:var(--color-muted)]">
                      {formatBytes(f.size)}
                    </span>
                    <span className="text-[11px] uppercase tracking-wider text-[color:var(--color-muted)]">
                      {formatDate(new Date(f.uploadedAt))}
                    </span>
                    <div className="flex items-center justify-end gap-1">
                      {f.downloadURL && (
                        <a
                          href={f.downloadURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-6 w-6 items-center justify-center border border-transparent text-[color:var(--color-dim)] hover:border-[color:var(--color-line-strong)] hover:text-[color:var(--color-fg-strong)]"
                          title="Download"
                        >
                          <Download className="h-3 w-3" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(f)}
                        disabled={deleting === f.id}
                        className="flex h-6 w-6 items-center justify-center border border-transparent text-[color:var(--color-dim)] hover:border-[color:var(--color-danger)]/40 hover:text-[color:var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-40"
                        title="Delete"
                      >
                        {deleting === f.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {dragActive && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center border-2 border-dashed border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/10 text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
              DROP TO UPLOAD
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function UploadingRow({
  name,
  progress,
}: {
  name: string;
  progress: UploadProgress;
}) {
  const pct = Math.round(progress.progress * 100);
  return (
    <div className="border-b border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent)]/10 px-4 py-2">
      <div className="flex items-center gap-3 text-[11px]">
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[color:var(--color-accent)]" />
        <span className="min-w-0 flex-1 truncate text-[color:var(--color-fg-strong)]">
          {name}
        </span>
        <span className="tabular-nums text-[color:var(--color-dim)]">
          {formatBytes(progress.bytesTransferred)} /{" "}
          {formatBytes(progress.totalBytes)}
        </span>
        <span className="tabular-nums text-[color:var(--color-accent)]">
          {pct}%
        </span>
      </div>
      <div className="mt-1 h-[2px] w-full bg-[color:var(--color-line)]">
        <div
          className="h-full bg-[color:var(--color-accent)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function DropZone() {
  return (
    <div className="m-4 flex flex-col items-center justify-center gap-2 border border-dashed border-[color:var(--color-line-strong)] bg-[color:var(--color-panel)] px-4 py-10 text-center">
      <Upload className="h-6 w-6 text-[color:var(--color-dim)]" />
      <div className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-fg)]">
        NO FILES ATTACHED
      </div>
      <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
        Drop a file here or click ATTACH FILE
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function friendlyStorageError(e: unknown): string {
  const code = (e as { code?: string })?.code;
  if (code === "storage/unauthorized")
    return "STORAGE UNAUTHORIZED — CHECK STORAGE RULES";
  if (code === "storage/canceled") return "UPLOAD CANCELED";
  if (code === "storage/quota-exceeded") return "STORAGE QUOTA EXCEEDED";
  if (code === "storage/retry-limit-exceeded")
    return "UPLOAD TIMED OUT — TRY AGAIN";
  return (e as Error)?.message?.toUpperCase?.() ?? "UPLOAD FAILED";
}
