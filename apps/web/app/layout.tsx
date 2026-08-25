import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rupert — Viability Engine",
  description: "Adversarial idea stress-testing. Zero sycophancy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={dark} afterSignOutUrl="/">
      <html lang="en">
        <body className="min-h-screen bg-zinc-950 font-sans antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
