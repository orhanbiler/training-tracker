"use client";

import { useState } from "react";
import { AlertTriangle, Check, Copy, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StoreError } from "@/lib/store";

const FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`;

const STORAGE_RULES = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /officers/{officerId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}`;

export function FirestoreErrorPanel({ error }: { error: StoreError }) {
  const isPerm = error.kind === "permission-denied";
  const isDown = error.kind === "unavailable";

  return (
    <div className="mx-auto mt-10 max-w-[640px] border border-[color:var(--color-danger)]/40 bg-[color:var(--color-panel)] p-6 fade-in">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--color-danger)]" />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-danger)]">
            {isPerm && "FIRESTORE ACCESS DENIED"}
            {isDown && "FIRESTORE UNAVAILABLE"}
            {!isPerm && !isDown && "FIRESTORE ERROR"}
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-wider text-[color:var(--color-dim)]">
            {isPerm &&
              "Your security rules are blocking reads. Paste the rules below in Firebase Console, then click Publish."}
            {isDown &&
              "The app can't reach Firestore right now. Check your internet connection and try again."}
            {!isPerm && !isDown && error.message}
          </div>
        </div>
      </div>

      {isPerm && (
        <>
          <RulesBlock
            label="FIRESTORE RULES"
            rules={FIRESTORE_RULES}
            href="https://console.firebase.google.com/project/_/firestore/rules"
          />
          <RulesBlock
            label="STORAGE RULES"
            rules={STORAGE_RULES}
            href="https://console.firebase.google.com/project/_/storage/rules"
          />
          <div className="mt-3 text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
            These starter rules allow any signed-in user full access. Tighten
            them per-collection for production.
          </div>
        </>
      )}

      {!isPerm && !isDown && (
        <pre className="mt-4 overflow-auto border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-3 text-[11px] text-[color:var(--color-fg)]">
          {error.code} · {error.message}
        </pre>
      )}
    </div>
  );
}

function RulesBlock({
  label,
  rules,
  href,
}: {
  label: string;
  rules: string;
  href: string;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(rules).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  }

  return (
    <div className="mt-4 border border-[color:var(--color-line)] bg-[color:var(--color-bg)]">
      <div className="flex items-center justify-between gap-2 border-b border-[color:var(--color-line)] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-dim)]">
        <span>{label}</span>
        <div className="flex items-center gap-1">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 border border-[color:var(--color-line-strong)] px-1.5 py-0.5 hover:border-[color:var(--color-fg)] hover:text-[color:var(--color-fg-strong)]"
          >
            OPEN <ExternalLink className="h-2.5 w-2.5" />
          </a>
          <button
            onClick={copy}
            className={cn(
              "flex items-center gap-1 border px-1.5 py-0.5",
              copied
                ? "border-[color:var(--color-ok)]/50 text-[color:var(--color-ok)]"
                : "border-[color:var(--color-line-strong)] hover:border-[color:var(--color-fg)] hover:text-[color:var(--color-fg-strong)]",
            )}
          >
            {copied ? (
              <>
                COPIED <Check className="h-2.5 w-2.5" />
              </>
            ) : (
              <>
                COPY <Copy className="h-2.5 w-2.5" />
              </>
            )}
          </button>
        </div>
      </div>
      <pre className="overflow-auto px-3 py-2 text-[11px] leading-relaxed text-[color:var(--color-fg)]">
        {rules}
      </pre>
    </div>
  );
}
