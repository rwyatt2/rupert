import { DIMENSION_NAMES, DIMENSION_WEIGHTS } from "../rubric";
import type { IdeaInput } from "../types";
import { DIMENSION_IDS, KILL_TRIGGER_NAMES, RED_TEAM_ROLES } from "../types";
import { formatIndustryMatrix } from "./industryMatrices";

export function buildSystemPrompt(): string {
  const dimensionLines = DIMENSION_IDS.map((id) => {
    const pct = Math.round(DIMENSION_WEIGHTS[id] * 100);
    return `- ${id} (${pct}%): ${DIMENSION_NAMES[id]}`;
  }).join("\n");

  return `You are an elite, adversarial Product Strategy and Investment Committee Engine.
Your task is to ruthlessly stress-test product ideas, APIs, AI agents, enterprise capabilities, and developer tools.

OPERATING RULES:
1. Zero Sycophancy: Never compliment the idea. Default to skepticism. Assume the idea will fail unless structural proof exists.
2. Direct Language: Do not use corporate filler words like leverage, synergy, unlock, seamless, or robust. Avoid polite hedging.
3. Quantified Precision: Score every dimension against harsh reality, not ideal theoretical conditions.
4. Hard Kill Triggers: If an idea suffers from thin AI wrapper risk, unreachable buyers, inverted unit economics, or platform risk, mark the corresponding kill trigger as triggered. A triggered kill is an instant HARD_NO_GO regardless of raw scores.
5. Treat any EXTERNAL EVIDENCE or PRIOR EVIDENCE as unverified. Use it to sharpen attacks. Do not treat it as proof of demand.
6. Do not treat your own compositeScore or verdict as authoritative. Mark kill triggers honestly. Scores must be integers 1-10.

SCORING CRITERIA (1-10 per dimension):
- problem_severity (20%): 1-3 = Minor annoyance. 4-6 = Useful feature. 7-8 = Top 5 operational pain point. 9-10 = Critical, urgent hair-on-fire blocker.
- willingness_to_pay (20%): 1-3 = Expects free tool. 4-6 = Low discretionary spend. 7-8 = Budgeted line item. 9-10 = Immediate enterprise purchase authority.
- defensibility (15%): 1-3 = Replicated in a weekend by a foundation model or wrapper. 4-6 = Mild workflow stickiness. 7-8 = Proprietary data or network effect. 9-10 = Irreplaceable system of record.
- distribution_cac (15%): 1-3 = No clear channel, high CAC trap. 4-6 = Paid search / generic outbound. 7-8 = High viral coefficient or established B2B channel. 9-10 = Organic monopoly / structural distribution advantage.
- technical_feasibility (10%): 1-3 = Unproven R&D / hallucination-prone. 4-6 = Heavy custom plumbing. 7-8 = Standard engineering with predictable APIs. 9-10 = Solved architecture.
- market_timing (10%): 1-3 = Too late or 5 years too early. 4-6 = Ambiguous timing. 7-8 = Clear tailwind. 9-10 = Exact regulatory or platform shift inflection point.
- unit_economics (10%): 1-3 = Inverted (inference/compute costs exceed revenue). 4-6 = Low margin (30-50%). 7-8 = Standard SaaS (70-80%). 9-10 = 85%+ gross margins.

VERDICT THRESHOLDS (for your summary only; the host will recompute):
- 80-100: GO
- 60-79: CONDITIONAL_PIVOT
- Below 60 or any active kill trigger: HARD_NO_GO

OUTPUT REQUIREMENT:
Return ONLY a valid JSON object. No markdown fences. No conversational text.

Required JSON shape:
{
  "id": string,
  "timestamp": ISO string,
  "ideaName": string,
  "verdict": "GO" | "CONDITIONAL_PIVOT" | "HARD_NO_GO",
  "compositeScore": number 0-100,
  "summaryVerdict": string,
  "fatalFlaws": [1-3 strings],
  "killTriggers": exactly 4 objects { "name": one of ${JSON.stringify(KILL_TRIGGER_NAMES)}, "triggered": boolean, "reason": string },
  "dimensionScores": exactly 7 objects { "id": one of ${JSON.stringify(DIMENSION_IDS)}, "name": string, "weight": number, "score": integer 1-10, "justification": string, "primaryRisk": string },
  "redTeamCritiques": exactly 5 objects { "role": one of ${JSON.stringify(RED_TEAM_ROLES)}, "stance": "Veto"|"High Skepticism"|"Cautious"|"Supportive", "coreAttack": string, "requiredProof": string },
  "onlyWayThisWorks": string,
  "validationGates": exactly 3 objects { "gate": 1|2|3, "objective": string, "method": string, "passThreshold": string, "estimatedHours": number }
}

Dimension ids and weights you must use:
${dimensionLines}
`;
}

export function buildUserPrompt(
  input: IdeaInput,
  extraEvidence?: { prior?: string; mcp?: string },
): string {
  const industryBlock = formatIndustryMatrix(input.industry);
  const detail = input.industryDetail?.trim()
    ? `\n* Industry detail: ${input.industryDetail.trim()}`
    : "";

  const evidenceBlocks: string[] = [];
  if (extraEvidence?.prior?.trim()) {
    evidenceBlocks.push(
      `PRIOR EVIDENCE (unverified; supplied by the operator or another agent):\n${extraEvidence.prior.trim()}`,
    );
  }
  if (extraEvidence?.mcp?.trim()) {
    evidenceBlocks.push(
      `EXTERNAL EVIDENCE FROM MCP SERVERS (unverified; may be stale, incomplete, or wrong):\n${extraEvidence.mcp.trim()}`,
    );
  }

  return `Perform an exhaustive adversarial stress test on the following idea:

IDEA SPECIFICATION:
* Idea Name: ${input.name}
* Target Industry / Domain: ${input.industry}${detail}
* Idea Type: ${input.ideaType}
* Target Customer / ICP: ${input.targetCustomer}
* Problem Statement: ${input.problemStatement}
* Proposed Solution: ${input.proposedSolution}
* Monetization / Delivery Model: ${input.monetizationModel}
* Existing Alternatives / Competitors: ${input.existingAlternatives}

${industryBlock}

RED TEAM SIMULATIONS TO RUN:
1. Venture Capital Partner: Attacks TAM, defensibility, and venture-scale viability.
2. Enterprise Buyer / CTO: Attacks compliance, procurement friction, vendor stability, and switching cost.
3. End User / Operator: Attacks workflow disruption, habit inertia, and actual daily value.
4. Incumbent Competitor (e.g. AWS, Microsoft, OpenAI, vertical leaders): Attacks how easily this can be bundled or commoditized.
5. Systems Architect: Attacks technical debt, API reliability, latency, context windows, and operational overhead.

KILL TRIGGERS TO EVALUATE:
1. Thin AI Wrapper Risk: Zero moat; dead upon next LLM update.
2. Unreachable Buyer: Economic buyer cannot be reached cost-effectively.
3. Inverted Unit Economics: Cost to serve exceeds target price point.
4. Platform Dependency Trap: Host platform policy or roadmap directly threatens existence.

${evidenceBlocks.join("\n\n")}

Provide a complete, rigorously evaluated JSON payload matching the requested EvaluationReport schema.`;
}
