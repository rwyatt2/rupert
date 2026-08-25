import { randomUUID } from "node:crypto";
import { saveReport } from "./history";
import { buildChatUserPrompt, buildSystemPrompt, buildUserPrompt } from "./prompts/redTeamEngine";
import { extractJson, getAdapter } from "./providers/index";
import { reconcileReport } from "./reconcile";
import {
  ChatBriefSchema,
  EvaluationReportSchema,
  IdeaInputSchema,
  ProviderSettingsSchema,
  type ChatBrief,
  type EvidenceSubject,
  type EvidenceUsed,
  type EvaluationReport,
  type IdeaInput,
  type ProviderSettings,
} from "./types";

export interface EvaluateOptions {
  idea?: IdeaInput;
  brief?: ChatBrief;
  settings: ProviderSettings;
  persist?: boolean;
  gatherEvidence?: (subject: EvidenceSubject, signal?: AbortSignal) => Promise<EvidenceUsed>;
  signal?: AbortSignal;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function abortError(): Error {
  const error = new Error("Evaluation cancelled");
  error.name = "AbortError";
  return error;
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw abortError();
}

function requireKey(settings: ProviderSettings): void {
  if (settings.provider !== "ollama" && !settings.apiKey.trim()) {
    throw new Error("Missing API key for selected provider.");
  }
}

async function completeJson(
  settings: ProviderSettings,
  system: string,
  user: string,
  signal?: AbortSignal,
): Promise<unknown> {
  throwIfAborted(signal);
  const adapter = getAdapter(settings.provider);
  const raw = await adapter.complete(settings, { system, user, jsonMode: true, signal });
  return extractJson(raw);
}

function resolveSubject(options: EvaluateOptions): {
  idea?: IdeaInput;
  brief?: ChatBrief;
  subject: EvidenceSubject;
  fallbackName: string;
} {
  const idea = options.idea ? IdeaInputSchema.parse(options.idea) : undefined;
  const brief = options.brief ? ChatBriefSchema.parse(options.brief) : undefined;
  if (!idea && !brief) {
    throw new Error("Provide either idea or brief");
  }
  if (idea) {
    return { idea, brief, subject: { kind: "idea", idea }, fallbackName: idea.name.trim() };
  }
  return {
    idea,
    brief,
    subject: { kind: "brief", messages: brief!.messages },
    fallbackName: "",
  };
}

export async function evaluateIdea(options: EvaluateOptions): Promise<EvaluationReport> {
  const { idea, brief, subject, fallbackName } = resolveSubject(options);
  const settings = ProviderSettingsSchema.parse(options.settings);
  requireKey(settings);

  let evidenceUsed: EvidenceUsed | undefined;
  if (options.gatherEvidence) {
    try {
      throwIfAborted(options.signal);
      evidenceUsed = await options.gatherEvidence(subject, options.signal);
    } catch (error) {
      if (isAbortError(error)) throw error;
      evidenceUsed = {
        servers: [],
        notes: "",
        gaps: [
          `Evidence pass failed: ${error instanceof Error ? error.message : String(error)}`,
        ],
      };
    }
  }

  const system = buildSystemPrompt();
  const user = idea
    ? buildUserPrompt(idea, {
        prior: idea.priorEvidence,
        mcp: evidenceUsed?.notes,
      })
    : buildChatUserPrompt(brief!, { mcp: evidenceUsed?.notes });

  throwIfAborted(options.signal);

  let parsed: unknown;
  try {
    parsed = await completeJson(settings, system, user, options.signal);
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new Error(
      `Provider call failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  let report: EvaluationReport;
  try {
    const withIds = hydrateMeta(parsed, fallbackName);
    report = EvaluationReportSchema.parse(withIds);
  } catch (firstError) {
    if (isAbortError(firstError)) throw firstError;
    try {
      parsed = await completeJson(
        settings,
        system,
        `Your previous JSON failed schema validation:\n${firstError instanceof Error ? firstError.message : String(firstError)}\n\nReturn ONLY corrected JSON matching the required EvaluationReport schema. No markdown.`,
        options.signal,
      );
      const withIds = hydrateMeta(parsed, fallbackName);
      report = EvaluationReportSchema.parse(withIds);
    } catch (repairError) {
      if (isAbortError(repairError)) throw repairError;
      throw new Error(
        `Model output failed validation after repair: ${repairError instanceof Error ? repairError.message : String(repairError)}`,
      );
    }
  }

  const reconciled = reconcileReport(report, report.ideaName);
  if (evidenceUsed) {
    reconciled.evidenceUsed = evidenceUsed;
  }

  if (options.persist !== false) {
    try {
      await saveReport(reconciled);
    } catch (error) {
      if (isAbortError(error)) throw error;
      // Disk history is best-effort; serverless hosts often have a read-only FS.
    }
  }

  return reconciled;
}

function hydrateMeta(parsed: unknown, fallbackName: string): unknown {
  if (!parsed || typeof parsed !== "object") return parsed;
  const obj = parsed as Record<string, unknown>;
  const fromModel = typeof obj.ideaName === "string" ? obj.ideaName.trim() : "";
  const ideaName = fallbackName || fromModel || "Untitled idea";
  return {
    ...obj,
    id: typeof obj.id === "string" && obj.id ? obj.id : `eval_${randomUUID()}`,
    timestamp: typeof obj.timestamp === "string" && obj.timestamp ? obj.timestamp : new Date().toISOString(),
    ideaName,
  };
}
