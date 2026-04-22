"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/logo";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) return <Splash message="AUTHENTICATING" />;
  if (!user) return <Splash message="REDIRECTING" />;

  return <>{children}</>;
}

function Splash({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[color:var(--color-bg)] text-[color:var(--color-fg)]">
      <Logo size={72} />
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-dim)]">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        {message}
      </div>
    </div>
  );
}
