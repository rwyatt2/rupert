import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { EvidenceSubject, EvidenceUsed, IdeaInput } from "@rupert/core";
import { enabledServers, loadMcpConfig, type McpConfig, type McpServerEntry } from "./config";

const SEARCHY = /search|query|list|get_|find|lookup|web/i;

function abortError(): Error {
  const error = new Error("Evaluation cancelled");
  error.name = "AbortError";
  return error;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw abortError();
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string, signal?: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError());
    };
    signal?.addEventListener("abort", onAbort, { once: true });

    promise.then(
      (value) => {
        clearTimeout(timer);
        signal?.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        signal?.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
}

function evidenceQueries(subject: EvidenceSubject): string[] {
  if (subject.kind === "brief") {
    const text = subject.messages.join("\n").slice(0, 800);
    return [
      `Incumbents and close substitutes for this idea: ${text}`,
      `Who is the economic buyer and what procurement friction exists for: ${text}`,
      `Pricing analogs and willingness to pay for: ${text}`,
    ];
  }

  const idea: IdeaInput = subject.idea;
  return [
    `Incumbents and close substitutes for: ${idea.name}. ${idea.existingAlternatives}. Industry: ${idea.industry}.`,
    `Who is the economic buyer for: ${idea.targetCustomer}? Typical procurement friction in ${idea.industry}.`,
    `Pricing analogs and willingness to pay for: ${idea.monetizationModel} solving ${idea.problemStatement.slice(0, 240)}`,
  ];
}

function pickTools(
  tools: Array<{ name: string }>,
  allowed?: string[],
): string[] {
  const filtered = allowed?.length
    ? tools.filter((t) => allowed.includes(t.name))
    : tools.filter((t) => SEARCHY.test(t.name));
  const names = (filtered.length ? filtered : tools).map((t) => t.name);
  return [...new Set(names)].slice(0, 3);
}

function toolArgs(toolName: string, query: string): Record<string, unknown> {
  if (/granola|meeting/i.test(toolName)) return { query };
  if (/search|query|find|lookup/i.test(toolName)) return { query, q: query, search_term: query };
  if (/list/i.test(toolName)) return {};
  return { query };
}

function textFromResult(result: unknown): string {
  if (!result || typeof result !== "object") return String(result ?? "");
  const content = (result as { content?: unknown }).content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (part && typeof part === "object" && "text" in part) {
          return String((part as { text: unknown }).text);
        }
        return JSON.stringify(part);
      })
      .join("\n");
  }
  return JSON.stringify(result);
}

async function gatherFromServer(
  name: string,
  entry: McpServerEntry,
  subject: EvidenceSubject,
  config: McpConfig,
  remainingCalls: { value: number },
  signal?: AbortSignal,
): Promise<{ notes: string; gap?: string }> {
  throwIfAborted(signal);
  if (!entry.command) {
    return { notes: "", gap: `${name}: no stdio command configured` };
  }

  const timeoutMs = config.timeoutMs ?? 15000;
  const transport = new StdioClientTransport({
    command: entry.command,
    args: entry.args ?? [],
    env: { ...process.env, ...entry.env } as Record<string, string>,
  });
  const client = new Client({ name: "rupert-evidence", version: "1.0.0" });

  try {
    await withTimeout(client.connect(transport), timeoutMs, name, signal);
    throwIfAborted(signal);
    const listed = await withTimeout(client.listTools(), timeoutMs, `${name} listTools`, signal);
    const toolNames = pickTools(listed.tools ?? [], entry.allowedTools);
    if (toolNames.length === 0) {
      return { notes: "", gap: `${name}: no usable tools` };
    }

    const chunks: string[] = [];
    for (const query of evidenceQueries(subject)) {
      throwIfAborted(signal);
      if (remainingCalls.value <= 0) break;
      const toolName = toolNames[remainingCalls.value % toolNames.length] ?? toolNames[0];
      if (!toolName) break;
      remainingCalls.value -= 1;
      try {
        const result = await withTimeout(
          client.callTool({ name: toolName, arguments: toolArgs(toolName, query) }),
          timeoutMs,
          `${name}.${toolName}`,
          signal,
        );
        chunks.push(`### ${name} / ${toolName}\nQuery: ${query}\n${textFromResult(result)}`);
      } catch (error) {
        if (isAbortError(error)) throw error;
        chunks.push(
          `### ${name} / ${toolName}\nFailed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
    return { notes: chunks.join("\n\n") };
  } catch (error) {
    if (isAbortError(error)) throw error;
    return {
      notes: "",
      gap: `${name}: ${error instanceof Error ? error.message : String(error)}`,
    };
  } finally {
    try {
      await client.close();
    } catch {
      // ignore
    }
  }
}

export interface GatherOptions {
  onlyServers?: string[];
  configPath?: string;
  signal?: AbortSignal;
}

export async function gatherMcpEvidence(
  subject: EvidenceSubject,
  options: GatherOptions = {},
): Promise<EvidenceUsed> {
  throwIfAborted(options.signal);
  const config = await loadMcpConfig(options.configPath);
  throwIfAborted(options.signal);
  const servers = enabledServers(config, options.onlyServers);
  if (servers.length === 0) {
    return {
      servers: [],
      notes: "",
      gaps: ["No MCP servers enabled in ~/.rupert/mcp.json"],
    };
  }

  const remainingCalls = { value: config.maxToolCalls ?? 6 };
  const notes: string[] = [];
  const gaps: string[] = [];
  const used: string[] = [];

  for (const { name, entry } of servers) {
    throwIfAborted(options.signal);
    if (remainingCalls.value <= 0) {
      gaps.push(`${name}: skipped (max tool calls reached)`);
      continue;
    }
    const result = await gatherFromServer(name, entry, subject, config, remainingCalls, options.signal);
    if (result.notes) {
      used.push(name);
      notes.push(result.notes);
    }
    if (result.gap) gaps.push(result.gap);
  }

  return {
    servers: used,
    notes: notes.join("\n\n").slice(0, 12000),
    gaps,
  };
}
