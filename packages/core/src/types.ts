import { z } from "zod";

export const AI_PROVIDERS = [
  "anthropic",
  "openai",
  "google",
  "openrouter",
  "ollama",
] as const;
export type AIProvider = (typeof AI_PROVIDERS)[number];

export const INDUSTRIES = [
  "B2B SaaS",
  "HealthTech",
  "Developer Tools",
  "FinTech",
  "Consumer AI",
  "Insurance",
] as const;
export type Industry = (typeof INDUSTRIES)[number];

export const IDEA_TYPES = [
  "B2B SaaS",
  "API",
  "Developer Tool",
  "AI Agent",
  "Internal Capability",
  "Consumer App",
  "Workflow Automation",
] as const;
export type IdeaType = (typeof IDEA_TYPES)[number];

export const DIMENSION_IDS = [
  "problem_severity",
  "willingness_to_pay",
  "defensibility",
  "distribution_cac",
  "technical_feasibility",
  "market_timing",
  "unit_economics",
] as const;
export type DimensionId = (typeof DIMENSION_IDS)[number];

export const RED_TEAM_ROLES = [
  "Venture Capital Partner",
  "Enterprise Buyer / CTO",
  "End User / Operator",
  "Incumbent Competitor",
  "Systems Architect",
] as const;
export type RedTeamRole = (typeof RED_TEAM_ROLES)[number];

export const KILL_TRIGGER_NAMES = [
  "Thin AI Wrapper Risk",
  "Unreachable Buyer",
  "Inverted Unit Economics",
  "Platform Dependency Trap",
] as const;
export type KillTriggerName = (typeof KILL_TRIGGER_NAMES)[number];

export const VERDICTS = ["GO", "CONDITIONAL_PIVOT", "HARD_NO_GO"] as const;
export type Verdict = (typeof VERDICTS)[number];

export const STANCES = ["Veto", "High Skepticism", "Cautious", "Supportive"] as const;
export type Stance = (typeof STANCES)[number];

export const ProviderSettingsSchema = z.object({
  provider: z.enum(AI_PROVIDERS),
  apiKey: z.string().default(""),
  model: z.string().min(1),
  customBaseUrl: z.string().optional(),
});
export type ProviderSettings = z.infer<typeof ProviderSettingsSchema>;

export const IdeaInputSchema = z.object({
  name: z.string().min(1),
  industry: z.enum(INDUSTRIES),
  industryDetail: z.string().optional(),
  ideaType: z.enum(IDEA_TYPES),
  targetCustomer: z.string().min(1),
  problemStatement: z.string().min(1),
  proposedSolution: z.string().min(1),
  monetizationModel: z.string().min(1),
  existingAlternatives: z.string().min(1),
  priorEvidence: z.string().optional(),
});
export type IdeaInput = z.infer<typeof IdeaInputSchema>;

export const ChatBriefSchema = z.object({
  messages: z.array(z.string().min(1)).min(1),
});
export type ChatBrief = z.infer<typeof ChatBriefSchema>;

export type EvidenceSubject =
  | { kind: "idea"; idea: IdeaInput }
  | { kind: "brief"; messages: string[] };

export const DimensionScoreSchema = z.object({
  id: z.enum(DIMENSION_IDS),
  name: z.string(),
  weight: z.number(),
  score: z.number().min(1).max(10),
  justification: z.string(),
  primaryRisk: z.string(),
});
export type DimensionScore = z.infer<typeof DimensionScoreSchema>;

export const KillTriggerSchema = z.object({
  name: z.enum(KILL_TRIGGER_NAMES),
  triggered: z.boolean(),
  reason: z.string(),
});
export type KillTrigger = z.infer<typeof KillTriggerSchema>;

export const RedTeamCritiqueSchema = z.object({
  role: z.enum(RED_TEAM_ROLES),
  stance: z.enum(STANCES),
  coreAttack: z.string(),
  requiredProof: z.string(),
});
export type RedTeamCritique = z.infer<typeof RedTeamCritiqueSchema>;

export const ValidationGateSchema = z.object({
  gate: z.number().int().min(1).max(3),
  objective: z.string(),
  method: z.string(),
  passThreshold: z.string(),
  estimatedHours: z.number(),
});
export type ValidationGate = z.infer<typeof ValidationGateSchema>;

export const EvidenceUsedSchema = z.object({
  servers: z.array(z.string()),
  notes: z.string(),
  gaps: z.array(z.string()),
});
export type EvidenceUsed = z.infer<typeof EvidenceUsedSchema>;

export const EvaluationReportSchema = z
  .object({
    id: z.string(),
    timestamp: z.string(),
    ideaName: z.string(),
    verdict: z.enum(VERDICTS),
    compositeScore: z.number().min(0).max(100),
    summaryVerdict: z.string(),
    fatalFlaws: z.array(z.string()).min(1).max(3),
    killTriggers: z.array(KillTriggerSchema),
    dimensionScores: z.array(DimensionScoreSchema),
    redTeamCritiques: z.array(RedTeamCritiqueSchema),
    onlyWayThisWorks: z.string(),
    validationGates: z.array(ValidationGateSchema),
    evidenceUsed: EvidenceUsedSchema.optional(),
  })
  .superRefine((report, ctx) => {
    if (report.dimensionScores.length !== 7) {
      ctx.addIssue({
        code: "custom",
        message: "dimensionScores must contain exactly 7 dimensions",
        path: ["dimensionScores"],
      });
    }
    const ids = new Set(report.dimensionScores.map((d) => d.id));
    for (const id of DIMENSION_IDS) {
      if (!ids.has(id)) {
        ctx.addIssue({
          code: "custom",
          message: `missing dimension ${id}`,
          path: ["dimensionScores"],
        });
      }
    }
    if (report.killTriggers.length !== 4) {
      ctx.addIssue({
        code: "custom",
        message: "killTriggers must contain exactly 4 triggers",
        path: ["killTriggers"],
      });
    }
    if (report.redTeamCritiques.length !== 5) {
      ctx.addIssue({
        code: "custom",
        message: "redTeamCritiques must contain exactly 5 roles",
        path: ["redTeamCritiques"],
      });
    }
    if (report.validationGates.length !== 3) {
      ctx.addIssue({
        code: "custom",
        message: "validationGates must contain exactly 3 gates",
        path: ["validationGates"],
      });
    }
  });
export type EvaluationReport = z.infer<typeof EvaluationReportSchema>;

export const EvaluateRequestSchema = z
  .object({
    idea: IdeaInputSchema.optional(),
    brief: ChatBriefSchema.optional(),
    settings: ProviderSettingsSchema,
    useMcpEvidence: z.boolean().optional().default(false),
    onlyServers: z.array(z.string()).optional(),
    persist: z.boolean().optional().default(true),
  })
  .superRefine((data, ctx) => {
    if (!data.idea && !data.brief) {
      ctx.addIssue({
        code: "custom",
        message: "Provide either idea or brief",
        path: ["idea"],
      });
    }
  });
export type EvaluateRequest = z.infer<typeof EvaluateRequestSchema>;
