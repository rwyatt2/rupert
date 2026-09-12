import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { scoreTextClass } from "@/lib/score-colors";
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

export function LandingPage() {
  return (
    <div className="landing-canvas relative flex min-h-screen flex-col">
      <div className="landing-scanline pointer-events-none absolute inset-0" aria-hidden />

      <header className="relative z-10 flex items-center justify-between border-b border-border/80 px-6 py-4 md:px-8">
        <p className="caption-mono font-bold tracking-tight text-foreground">RUPERT</p>
        <nav className="flex items-center gap-4">
          <Link
            href="/privacy"
            className="caption-mono text-muted-foreground hover-interact hover:text-foreground"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="caption-mono text-muted-foreground hover-interact hover:text-foreground"
          >
            Terms
          </Link>
          <Button asChild size="sm">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-12 px-6 py-12 md:px-8 lg:flex-row lg:items-center lg:gap-16">
        <section className="animate-fadeIn max-w-xl space-y-6">
          <p className="caption-mono text-muted-foreground">Viability engine</p>
          <h1 className="h0 font-mono tracking-tight">RUPERT</h1>
          <p className="h2 tracking-tight text-foreground/90">Your idea will not survive this.</p>
          <p className="description max-w-md text-muted-foreground">
            Adversarial idea stress-testing. Zero sycophancy. Local-first. Bring your own keys.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild size="md">
              <Link href="/sign-in">Stress-test an idea</Link>
            </Button>
            <p className="caption-mono text-muted-foreground">Sign in required</p>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
            {PRINCIPLES.map((principle) => (
              <li key={principle} className="caption-mono flex items-center gap-2 text-muted-foreground">
                <span className="inline-block size-1 rounded-full bg-muted-foreground" aria-hidden />
                {principle}
              </li>
            ))}
          </ul>
        </section>

        <aside className="animate-fadeIn w-full max-w-md space-y-4" aria-hidden>
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="caption-mono text-muted-foreground">Sample verdict</p>
                <h2 className="h3 mt-2">AI for everything</h2>
              </div>
              <Badge variant="destructive">Hard no go</Badge>
            </div>
            <p className="description mt-4 text-muted-foreground">
              No buyer, no wedge, no reason this exists. A thin wrapper on someone else&apos;s model.
            </p>
            <div className="mt-6 border-t border-border pt-4 text-right">
              <span className="caption-mono block text-muted-foreground">Composite score</span>
              <span className="font-mono text-4xl font-extrabold text-destructive">
                41
                <span className="text-lg text-muted-foreground">/100</span>
              </span>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="caption-mono mb-4 text-muted-foreground">Instant kill trigger status</h3>
            <div className="space-y-2">
              {MOCK_TRIGGERS.map((trigger) => (
                <div key={trigger.name} className="flex items-center justify-between gap-2">
                  <span className="description text-foreground/90">{trigger.name}</span>
                  <Badge variant={trigger.triggered ? "destructive" : "muted"}>
                    {trigger.triggered ? "Triggered" : "Cleared"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="caption-mono mb-4 text-muted-foreground">Dimension scores</h3>
            <div className="space-y-2">
              {MOCK_DIMENSIONS.map((dimension) => (
                <div key={dimension.name} className="flex items-center justify-between">
                  <span className="description text-foreground/90">{dimension.name}</span>
                  <span className={`font-mono font-bold ${scoreTextClass(dimension.score)}`}>
                    {dimension.score}/10
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </main>

      <footer className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-border/80 px-6 py-4 md:px-8">
        <p className="caption-mono text-muted-foreground">Adversarial by design</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="caption-mono text-muted-foreground hover-interact hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="caption-mono text-muted-foreground hover-interact hover:text-foreground">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
}
