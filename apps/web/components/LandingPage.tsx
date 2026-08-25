import Link from "next/link";

const PRINCIPLES = ["Zero sycophancy", "Seven dimensions", "Instant kill triggers"] as const;

const MOCK_TRIGGERS = [
  { name: "Thin AI Wrapper Risk", triggered: true },
  { name: "Unreachable Buyer", triggered: true },
  { name: "Inverted Unit Economics", triggered: false },
  { name: "Platform Dependency Trap", triggered: false },
] as const;

const MOCK_DIMENSIONS = [
  { name: "Willingness to pay", score: 3 },
  { name: "Defensibility", score: 2 },
  { name: "Unit economics", score: 4 },
] as const;

function scoreColor(score: number) {
  if (score >= 8) return "text-emerald-400";
  if (score >= 6) return "text-amber-400";
  return "text-rose-400";
}

export function LandingPage() {
  return (
    <div className="landing-canvas relative flex min-h-screen flex-col text-zinc-100">
      <div className="landing-scanline pointer-events-none absolute inset-0" aria-hidden />

      <header className="relative z-10 flex items-center justify-between border-b border-zinc-800/80 px-5 py-4 sm:px-8">
        <p className="font-mono text-sm font-bold tracking-tight">RUPERT</p>
        <nav className="flex items-center gap-4 text-xs font-mono uppercase tracking-wider">
          <Link href="/privacy" className="text-zinc-500 transition hover:text-zinc-300">
            Privacy
          </Link>
          <Link href="/terms" className="text-zinc-500 transition hover:text-zinc-300">
            Terms
          </Link>
          <Link
            href="/sign-in"
            className="rounded bg-zinc-100 px-3 py-1.5 font-bold text-zinc-950 transition hover:bg-zinc-200"
          >
            Sign in
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-12 px-5 py-12 sm:px-8 lg:flex-row lg:items-center lg:gap-16">
        <section className="animate-fadeIn max-w-xl space-y-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-500">
            Viability engine
          </p>
          <h1 className="font-mono text-5xl font-bold tracking-tight text-zinc-100 sm:text-7xl">
            RUPERT
          </h1>
          <p className="text-2xl font-semibold tracking-tight text-zinc-200 sm:text-3xl">
            Your idea will not survive this.
          </p>
          <p className="max-w-md text-sm leading-6 text-zinc-400">
            Adversarial idea stress-testing. Zero sycophancy. Local-first. Bring your own keys.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded bg-zinc-100 px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 transition hover:bg-zinc-200"
            >
              Stress-test an idea
            </Link>
            <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-600">
              Sign in required
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 pt-2 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
            {PRINCIPLES.map((principle) => (
              <li key={principle} className="flex items-center gap-2">
                <span className="inline-block h-1 w-1 rounded-full bg-zinc-500" aria-hidden />
                {principle}
              </li>
            ))}
          </ul>
        </section>

        <aside className="animate-fadeIn w-full max-w-md space-y-4" aria-hidden>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  Sample verdict
                </p>
                <h2 className="mt-1 text-lg font-bold text-zinc-100">AI for everything</h2>
              </div>
              <span className="shrink-0 rounded border border-rose-600 bg-rose-950 px-3 py-1 text-xs font-mono font-bold tracking-wider text-rose-400">
                HARD NO GO
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-zinc-400">
              No buyer, no wedge, no reason this exists. A thin wrapper on someone else&apos;s model.
            </p>
            <div className="mt-4 border-t border-zinc-800 pt-4 text-right">
              <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                Composite score
              </span>
              <span className="font-mono text-4xl font-extrabold text-rose-400">
                41
                <span className="text-lg text-zinc-600">/100</span>
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="mb-3 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Instant kill trigger status
            </h3>
            <div className="space-y-2">
              {MOCK_TRIGGERS.map((trigger) => (
                <div key={trigger.name} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-zinc-300">{trigger.name}</span>
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                      trigger.triggered
                        ? "border border-rose-800 bg-rose-950 text-rose-400"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {trigger.triggered ? "TRIGGERED" : "CLEARED"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="mb-3 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Dimension scores
            </h3>
            <div className="space-y-2">
              {MOCK_DIMENSIONS.map((dimension) => (
                <div key={dimension.name} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300">{dimension.name}</span>
                  <span className={`font-mono font-bold ${scoreColor(dimension.score)}`}>
                    {dimension.score}/10
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      <footer className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80 px-5 py-4 text-[11px] font-mono uppercase tracking-wider text-zinc-600 sm:px-8">
        <p>Adversarial by design</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-zinc-400">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-zinc-400">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
}
