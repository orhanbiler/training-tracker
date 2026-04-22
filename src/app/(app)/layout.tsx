import { AuthGate } from "@/components/auth-gate";
import { Sidebar } from "@/components/sidebar";
import { QuickActionsBar } from "@/components/quick-actions-bar";
import { StoreErrorBanner } from "@/components/store-error-banner";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <StoreErrorBanner />
          <main className="flex-1 pb-14">{children}</main>
          <QuickActionsBar />
        </div>
      </div>
    </AuthGate>
  );
}
