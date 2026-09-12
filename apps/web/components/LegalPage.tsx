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
    <main className="min-h-screen bg-background px-6 py-16 text-foreground md:px-8">
      <article className="mx-auto max-w-xl space-y-6">
        <Link
          href="/"
          className="caption-mono inline-block text-muted-foreground hover-interact hover:text-foreground"
        >
          Rupert
        </Link>
        <h1 className="h1 tracking-tight">{title}</h1>
        <div className="body space-y-4 text-muted-foreground">{children}</div>
        <Link href="/" className="description inline-block text-foreground underline underline-offset-2 hover-interact">
          Back to home
        </Link>
      </article>
    </main>
  );
}
