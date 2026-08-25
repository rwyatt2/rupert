import { computeCompositeScore, DIMENSION_NAMES, DIMENSION_WEIGHTS, verdictFromScore } from "./rubric";
import {
  DIMENSION_IDS,
  KILL_TRIGGER_NAMES,
  RED_TEAM_ROLES,
  type DimensionScore,
  type EvaluationReport,
  type KillTrigger,
  type RedTeamCritique,
  type ValidationGate,
} from "./types";

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 1;
  return Math.min(10, Math.max(1, Math.round(score)));
}

export function reconcileReport(
  raw: EvaluationReport,
  ideaName: string,
): EvaluationReport {
  const byId = new Map(raw.dimensionScores.map((d) => [d.id, d]));
  const dimensionScores: DimensionScore[] = DIMENSION_IDS.map((id) => {
    const existing = byId.get(id);
    return {
      id,
      name: DIMENSION_NAMES[id],
      weight: DIMENSION_WEIGHTS[id],
      score: clampScore(existing?.score ?? 1),
      justification: existing?.justification || "Model omitted this dimension. Treat as unproven.",
      primaryRisk: existing?.primaryRisk || "Missing justification.",
    };
  });

  const byTrigger = new Map(raw.killTriggers.map((t) => [t.name, t]));
  const killTriggers: KillTrigger[] = KILL_TRIGGER_NAMES.map((name) => {
    const existing = byTrigger.get(name);
    return {
      name,
      triggered: Boolean(existing?.triggered),
      reason: existing?.reason || (existing?.triggered ? "Triggered without reason." : "Not triggered."),
    };
  });

  const byRole = new Map(raw.redTeamCritiques.map((c) => [c.role, c]));
  const redTeamCritiques: RedTeamCritique[] = RED_TEAM_ROLES.map((role) => {
    const existing = byRole.get(role);
    return {
      role,
      stance: existing?.stance ?? "High Skepticism",
      coreAttack: existing?.coreAttack || "No critique returned. Assume veto until proven otherwise.",
      requiredProof: existing?.requiredProof || "Provide primary evidence of demand and a defensible wedge.",
    };
  });

  const validationGates: ValidationGate[] = [1, 2, 3].map((gate) => {
    const existing = raw.validationGates.find((g) => g.gate === gate);
    return {
      gate,
      objective: existing?.objective || `Validation gate ${gate}`,
      method: existing?.method || "Undefined. Do not write production code.",
      passThreshold: existing?.passThreshold || "No pass threshold set — fail closed.",
      estimatedHours: existing?.estimatedHours ?? 8,
    };
  });

  const compositeScore = computeCompositeScore(dimensionScores);
  const anyKill = killTriggers.some((t) => t.triggered);
  const verdict = verdictFromScore(compositeScore, anyKill);

  const fatalFlaws = raw.fatalFlaws.slice(0, 3);
  if (fatalFlaws.length === 0) {
    fatalFlaws.push("Model returned no fatal flaws. Assume the idea is unproven.");
  }

  return {
    ...raw,
    id: raw.id || `eval_${Date.now()}`,
    timestamp: raw.timestamp || new Date().toISOString(),
    ideaName,
    dimensionScores,
    killTriggers,
    redTeamCritiques,
    validationGates,
    fatalFlaws,
    compositeScore,
    verdict,
  };
}
