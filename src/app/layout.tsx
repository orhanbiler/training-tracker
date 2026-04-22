import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { StoreProvider } from "@/lib/store";

const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Cheverly PD — Training Command",
    template: "%s · Cheverly PD",
  },
  description:
    "Cheverly Police Department training and certification tracking — real-time expiration monitoring and compliance operations.",
  applicationName: "Cheverly PD Training Command",
  openGraph: {
    title: "Cheverly PD — Training Command",
    description:
      "Real-time training and certification tracking for the Cheverly Police Department.",
    siteName: "Cheverly PD Training Command",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${mono.variable} h-full antialiased`}>
      <body className="min-h-screen bg-[color:var(--color-bg)] text-[color:var(--color-fg)]">
        <AuthProvider>
          <StoreProvider>{children}</StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
