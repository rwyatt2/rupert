import { clerkKeyStatus } from "@/lib/clerk-env";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rupert — Viability Engine",
  description: "Adversarial idea stress-testing. Zero sycophancy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const keys = clerkKeyStatus();
  // #region agent log
  fetch("http://127.0.0.1:7316/ingest/f5df121e-99d4-46b1-8d42-b5498b9cb05c", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "42079f" },
    body: JSON.stringify({
      sessionId: "42079f",
      runId: "post-fix",
      location: "layout.tsx:render",
      message: "root layout render",
      data: { ...keys, vercelEnv: process.env.VERCEL_ENV || null, nodeEnv: process.env.NODE_ENV || null },
      timestamp: Date.now(),
      hypothesisId: "E",
    }),
  }).catch(() => {});
  // #endregion

  const tree = (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 font-sans antialiased">{children}</body>
    </html>
  );

  if (!keys.hasPublishableKey) return tree;
  return (
    <ClerkProvider appearance={dark} afterSignOutUrl="/">
      {tree}
    </ClerkProvider>
  );
}
