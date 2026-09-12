import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { copy } from "@/lib/copy";
import { scoreTextClass } from "@/lib/score-colors";
import Link from "next/link";

const MOCK_TRIGGERS = [
  { name: "Thin AI wrapper", triggered: true },
  { name: "Unreachable buyer", triggered: true },
  { name: "Inverted unit economics", triggered: false },
  { name: "Platform dependency trap", triggered: false },
] as const;

const MOCK_DIMENSIONS = [
  { name: "Willingness to pay", score: 3 },
  { name: "Defensibility", score: 2 },
  { name: "Unit economics", score: 4 },
] as const;

export function LandingPage() {
  return (
    <div className="landing-canvas relative flex min-h-screen flex-col" data-testid="landing-page">
      <div className="landing-scanline pointer-events-none absolute inset-0" aria-hidden />

      <header className="relative z-10 flex flex-col gap-4 border-b border-border/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-8">
        <p className="caption-mono font-bold tracking-tight text-foreground">{copy.brand.name.toUpperCase()}</p>
        <nav className="flex flex-wrap items-center gap-4" aria-label="Site">
          <Link
            href="/privacy"
            className="caption-mono text-muted-foreground hover-interact hover:text-foreground"
          >
            {copy.nav.privacy}
          </Link>
          <Link
            href="/terms"
            className="caption-mono text-muted-foreground hover-interact hover:text-foreground"
          >
            {copy.nav.terms}
          </Link>
          <Button asChild size="sm">
            <Link href="/sign-in">{copy.nav.signIn}</Link>
          </Button>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-8 px-4 py-8 sm:gap-12 sm:px-6 sm:py-12 md:px-8 lg:flex-row lg:items-center lg:gap-16">
        <section className="animate-fadeIn w-full max-w-xl space-y-6">
          <p className="caption-mono text-muted-foreground">{copy.brand.tagline}</p>
          <h1 className="h0 font-mono tracking-tight">{copy.brand.name.toUpperCase()}</h1>
          <p className="h2 tracking-tight text-foreground/90">{copy.landing.headline}</p>
          <p className="description max-w-md text-muted-foreground">{copy.landing.description}</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <Button asChild size="lg" className="min-h-11 w-full sm:w-auto">
              <Link href="/sign-in">{copy.landing.cta}</Link>
            </Button>
            <p className="caption-mono text-muted-foreground">{copy.landing.ctaHint}</p>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
            {copy.landing.principles.map((principle) => (
              <li key={principle} className="caption-mono flex items-center gap-2 text-muted-foreground">
                <span className="inline-block size-1 rounded-full bg-muted-foreground" aria-hidden />
                {principle}
              </li>
            ))}
          </ul>
        </section>

        <aside className="animate-fadeIn w-full max-w-md space-y-4 lg:shrink-0" aria-hidden>
          <Card className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="caption-mono text-muted-foreground">{copy.landing.sampleVerdict}</p>
                <h2 className="h3 mt-2">{copy.landing.sampleIdea}</h2>
              </div>
              <Badge variant="destructive" className="w-fit shrink-0">
                {copy.landing.sampleBadge}
              </Badge>
            </div>
            <p className="description mt-4 text-muted-foreground">{copy.landing.sampleSummary}</p>
            <div className="mt-6 border-t border-border pt-4 text-left sm:text-right">
              <span className="caption-mono block text-muted-foreground">{copy.scorecard.composite}</span>
              <span className="font-mono text-4xl font-extrabold text-destructive">
                41
                <span className="text-lg text-muted-foreground">/100</span>
              </span>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h3 className="caption-mono mb-4 text-muted-foreground">{copy.landing.killTriggers}</h3>
            <div className="space-y-2">
              {MOCK_TRIGGERS.map((trigger) => (
                <div key={trigger.name} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="description text-foreground/90">{trigger.name}</span>
                  <Badge variant={trigger.triggered ? "destructive" : "muted"} className="w-fit">
                    {trigger.triggered ? copy.landing.triggered : copy.landing.cleared}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h3 className="caption-mono mb-4 text-muted-foreground">{copy.landing.dimensions}</h3>
            <div className="space-y-2">
              {MOCK_DIMENSIONS.map((dimension) => (
                <div key={dimension.name} className="flex items-center justify-between gap-4">
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

      <footer className="relative z-10 flex flex-col gap-4 border-t border-border/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-8">
        <p className="caption-mono text-muted-foreground">{copy.landing.footer}</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="caption-mono text-muted-foreground hover-interact hover:text-foreground">
            {copy.nav.privacy}
          </Link>
          <Link href="/terms" className="caption-mono text-muted-foreground hover-interact hover:text-foreground">
            {copy.nav.terms}
          </Link>
        </div>
      </footer>
    </div>
  );
}
