import { copy } from "@/lib/copy";
import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground sm:px-6 md:px-8 md:py-16">
      <article className="mx-auto max-w-xl space-y-6">
        <Link
          href="/"
          className="caption-mono inline-block text-muted-foreground hover-interact hover:text-foreground"
        >
          {copy.brand.name}
        </Link>
        <h1 className="h1 tracking-tight">{title}</h1>
        <div className="body space-y-4 text-muted-foreground">{children}</div>
        <Link href="/" className="description inline-block text-foreground underline underline-offset-2 hover-interact">
          {copy.legal.back}
        </Link>
      </article>
    </main>
  );
}
