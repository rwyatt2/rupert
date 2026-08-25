import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rupert — Viability Engine",
  description: "Adversarial idea stress-testing. Zero sycophancy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 font-sans antialiased">{children}</body>
    </html>
  );
}
