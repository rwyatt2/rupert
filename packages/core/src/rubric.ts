import type { DimensionId, Verdict } from "./types";

export const DIMENSION_WEIGHTS: Record<DimensionId, number> = {
  problem_severity: 0.2,
  willingness_to_pay: 0.2,
  defensibility: 0.15,
  distribution_cac: 0.15,
  technical_feasibility: 0.1,
  market_timing: 0.1,
  unit_economics: 0.1,
};

export const DIMENSION_NAMES: Record<DimensionId, string> = {
  problem_severity: "Problem Severity",
  willingness_to_pay: "Willingness to Pay & Buyer Authority",
  defensibility: "Defensibility & Moat",
  distribution_cac: "Distribution & CAC",
  technical_feasibility: "Technical & Operational Feasibility",
  market_timing: "Market Timing & Regulatory/Platform Risk",
  unit_economics: "Unit Economics & Margin Durability",
};

export function verdictFromScore(score: number, anyKillTriggered: boolean): Verdict {
  if (anyKillTriggered) return "HARD_NO_GO";
  if (score >= 80) return "GO";
  if (score >= 60) return "CONDITIONAL_PIVOT";
  return "HARD_NO_GO";
}

export function computeCompositeScore(
  scores: Array<{ id: DimensionId; score: number }>,
): number {
  const weighted = scores.reduce((sum, dim) => {
    const weight = DIMENSION_WEIGHTS[dim.id] ?? 0;
    return sum + dim.score * weight * 10;
  }, 0);
  return Math.round(Math.min(100, Math.max(0, weighted)));
}
