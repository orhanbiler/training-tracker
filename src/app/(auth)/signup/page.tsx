"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(form: FormData) {
    setError(null);
    setSubmitting(true);
    try {
      const name = String(form.get("name") ?? "");
      const email = String(form.get("email") ?? "");
      const password = String(form.get("password") ?? "");
      await signUp(email, password, name);
      router.replace("/");
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
      router.replace("/");
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel)] p-6 fade-in">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel-2)]">
          <ShieldCheck className="h-5 w-5 text-[color:var(--color-fg-strong)]" />
        </div>
        <div>
          <div className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-fg-strong)]">
            TRN//OPS
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
            NEW OPERATOR REGISTRATION
          </div>
        </div>
      </div>

      <h1 className="text-[15px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-fg-strong)]">
        CREATE ACCOUNT
      </h1>
      <p className="mt-1 text-[11px] uppercase tracking-wider text-[color:var(--color-dim)]">
        Provision a command-center account
      </p>

      <AuthForm
        includeName
        submitLabel="CREATE ACCOUNT"
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
        onGoogle={handleGoogle}
      />

      <div className="mt-4 border-t border-[color:var(--color-line)] pt-4 text-center text-[11px] uppercase tracking-wider text-[color:var(--color-dim)]">
        ALREADY HAVE AN ACCOUNT?{" "}
        <Link
          href="/login"
          className="text-[color:var(--color-accent)] hover:text-[color:var(--color-fg-strong)]"
        >
          SIGN IN →
        </Link>
      </div>
    </div>
  );
}

function friendlyError(e: unknown): string {
  const code = (e as { code?: string })?.code;
  if (code === "auth/email-already-in-use") return "EMAIL ALREADY IN USE";
  if (code === "auth/invalid-email") return "INVALID EMAIL";
  if (code === "auth/weak-password")
    return "WEAK PASSWORD — MIN 6 CHARACTERS";
  if (code === "auth/popup-closed-by-user") return "POPUP CLOSED";
  return (e as Error)?.message?.toUpperCase?.() ?? "AUTH ERROR";
}
