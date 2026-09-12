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

  const tree = (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">{children}</body>
    </html>
  );

  if (!keys.hasPublishableKey) return tree;
  return (
    <ClerkProvider appearance={dark} afterSignOutUrl="/">
      {tree}
    </ClerkProvider>
  );
}
