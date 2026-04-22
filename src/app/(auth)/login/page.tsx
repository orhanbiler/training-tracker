"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(form: FormData) {
    setError(null);
    setSubmitting(true);
    try {
      const email = String(form.get("email") ?? "");
      const password = String(form.get("password") ?? "");
      await signIn(email, password);
      router.replace("/");
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel)] p-6 fade-in">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <Logo size={88} />
        <div>
          <div className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-fg-strong)]">
            CHEVERLY POLICE
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
            TRN//OPS · ACCESS TERMINAL
          </div>
        </div>
      </div>

      <div className="border-t border-[color:var(--color-line)] pt-5">
        <h1 className="text-[14px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-fg-strong)]">
          SIGN IN
        </h1>
        <p className="mt-1 text-[11px] uppercase tracking-wider text-[color:var(--color-dim)]">
          Authenticate to continue
        </p>

        <AuthForm
          submitLabel="SIGN IN"
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
        />
      </div>

      <div className="mt-4 border-t border-[color:var(--color-line)] pt-4 text-center text-[11px] uppercase tracking-wider text-[color:var(--color-dim)]">
        NEW USER?{" "}
        <Link
          href="/signup"
          className="text-[color:var(--color-accent)] hover:text-[color:var(--color-fg-strong)]"
        >
          CREATE AN ACCOUNT →
        </Link>
      </div>
    </div>
  );
}

function friendlyError(e: unknown): string {
  const code = (e as { code?: string })?.code;
  if (code === "auth/invalid-credential" || code === "auth/wrong-password")
    return "INVALID CREDENTIALS";
  if (code === "auth/user-not-found") return "USER NOT FOUND";
  if (code === "auth/too-many-requests")
    return "TOO MANY ATTEMPTS — TRY AGAIN LATER";
  return (e as Error)?.message?.toUpperCase?.() ?? "AUTH ERROR";
}
