import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Sidebar } from "@/components/sidebar";
import { QuickActionsBar } from "@/components/quick-actions-bar";

const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TRN//OPS — Training & Certification Command",
  description:
    "Operational tracking for police department training and certification expirations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${mono.variable} h-full antialiased`}>
      <body className="min-h-screen bg-[color:var(--color-bg)] text-[color:var(--color-fg)]">
        <StoreProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex min-h-screen min-w-0 flex-1 flex-col">
              <main className="flex-1 pb-14">{children}</main>
              <QuickActionsBar />
            </div>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
