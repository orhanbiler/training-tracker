"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";

export default function SignupPage() {
  const { signUp } = useAuth();
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

  return (
    <div className="border border-[color:var(--color-line-strong)] bg-[color:var(--color-panel)] p-6 fade-in">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <Logo size={88} />
        <div>
          <div className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-fg-strong)]">
            CHEVERLY POLICE
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
            TRN//OPS · NEW OPERATOR
          </div>
        </div>
      </div>

      <div className="border-t border-[color:var(--color-line)] pt-5">
        <h1 className="text-[14px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-fg-strong)]">
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
        />
      </div>

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
  return (e as Error)?.message?.toUpperCase?.() ?? "AUTH ERROR";
}
