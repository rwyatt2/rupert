import type { EvaluationReport } from "@rupert/core";

export function scoreTextClass(score: number) {
  if (score >= 8) return "text-success";
  if (score >= 6) return "text-warning";
  return "text-destructive";
}

export function scoreBarClass(score: number) {
  if (score >= 8) return "bg-success";
  if (score >= 6) return "bg-warning";
  return "bg-destructive";
}

export function verdictBadgeClass(verdict: EvaluationReport["verdict"]) {
  switch (verdict) {
    case "GO":
      return "border-success/50 bg-success/10 text-success";
    case "CONDITIONAL_PIVOT":
      return "border-warning/50 bg-warning/10 text-warning";
    case "HARD_NO_GO":
      return "border-destructive/50 bg-destructive/10 text-destructive";
  }
}

export function stanceBadgeClass(stance: "Veto" | "High Skepticism" | "Cautious" | "Supportive") {
  switch (stance) {
    case "Veto":
      return "border-destructive/40 bg-destructive/10 text-destructive";
    case "High Skepticism":
      return "border-warning/40 bg-warning/10 text-warning";
    case "Cautious":
      return "border-warning/30 bg-warning/5 text-warning";
    case "Supportive":
      return "border-success/40 bg-success/10 text-success";
  }
}
