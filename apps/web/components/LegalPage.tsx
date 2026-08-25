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
    <main className="min-h-screen bg-zinc-950 px-4 py-16 text-zinc-100">
      <article className="mx-auto max-w-xl space-y-6">
        <Link
          href="/"
          className="inline-block font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-300"
        >
          Rupert
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <div className="space-y-4 text-sm leading-6 text-zinc-400">{children}</div>
        <Link href="/" className="inline-block text-sm text-zinc-300 underline underline-offset-2">
          Back to home
        </Link>
      </article>
    </main>
  );
}
