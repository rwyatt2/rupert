import type { ProviderSettings } from "../types";
import type { ProviderAdapter } from "./types";

const LOCAL_OLLAMA = "http://127.0.0.1:11434";

export function isOllamaCloud(baseUrl?: string): boolean {
  try {
    const host = new URL(normalizeOllamaInput(baseUrl)).hostname;
    return host === "ollama.com" || host.endsWith(".ollama.com");
  } catch {
    return /ollama\.com/i.test(baseUrl || "");
  }
}

function looksLikeApiKey(value: string): boolean {
  return value.length >= 20 && !value.includes(".") && !value.includes("/") && !value.includes(":");
}

function normalizeOllamaInput(raw?: string): string {
  let input = (raw || LOCAL_OLLAMA).trim() || LOCAL_OLLAMA;
  if (!/^https?:\/\//i.test(input)) {
    if (looksLikeApiKey(input)) {
      throw new Error(
        "Ollama base URL looks like an API key. Put the key in the API key field and set the base URL to https://ollama.com (cloud) or http://127.0.0.1:11434 (local).",
      );
    }
    input = `http://${input}`;
  }
  return input;
}

function resolveChatUrl(raw?: string): { url: string; openaiCompat: boolean } {
  const parsed = new URL(normalizeOllamaInput(raw));
  if (parsed.hostname === "localhost") parsed.hostname = "127.0.0.1";
  const path = parsed.pathname.replace(/\/+$/, "");

  if (path.endsWith("/v1/chat/completions")) {
    return { url: `${parsed.origin}${path}`, openaiCompat: true };
  }
  if (path.endsWith("/v1")) {
    return { url: `${parsed.origin}${path}/chat/completions`, openaiCompat: true };
  }
  if (path.endsWith("/api/chat")) {
    return { url: `${parsed.origin}${path}`, openaiCompat: false };
  }
  return { url: `${parsed.origin}/api/chat`, openaiCompat: false };
}

function collectErrorParts(error: unknown): { messages: string[]; codes: string[] } {
  const messages: string[] = [];
  const codes: string[] = [];
  const seen = new Set<unknown>();
  const stack: unknown[] = [error];

  while (stack.length > 0 && seen.size < 8) {
    const current = stack.pop();
    if (!current || seen.has(current)) continue;
    seen.add(current);
    if (current instanceof Error) {
      if (current.message) messages.push(current.message);
      const extra = current as Error & { code?: unknown; cause?: unknown; errors?: unknown[] };
      if (typeof extra.code === "string") codes.push(extra.code);
      if (extra.cause) stack.push(extra.cause);
      if (Array.isArray(extra.errors)) stack.push(...extra.errors);
    }
  }
  return { messages, codes };
}

function describeFetchFailure(error: unknown, target: string): Error {
  const { messages, codes } = collectErrorParts(error);
  const joined = `${codes.join(" ")} ${messages.join(" ")}`;
  const local = /127\.0\.0\.1|localhost/.test(target);

  if (/ECONNREFUSED|ENOTFOUND|EHOSTUNREACH|ETIMEDOUT/i.test(joined)) {
    if (local) {
      return new Error(
        `Could not reach local Ollama at ${target}. Start the Ollama app (or \`ollama serve\`), or switch the base URL to https://ollama.com and paste an API key from ollama.com/settings/keys.`,
      );
    }
    return new Error(`Could not reach Ollama at ${target}. Check the base URL.`);
  }

  const detail = [...codes, ...messages.filter((m) => m !== "fetch failed")].join(" — ") || "fetch failed";
  return new Error(`Ollama request to ${target} failed: ${detail}`);
}

export const ollamaAdapter: ProviderAdapter = {
  async complete(settings, request) {
    const { url, openaiCompat } = resolveChatUrl(settings.customBaseUrl);
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const apiKey = settings.apiKey.trim();
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers,
        signal: request.signal,
        body: JSON.stringify(
          openaiCompat
            ? {
                model: settings.model,
                response_format: { type: "json_object" },
                messages: [
                  { role: "system", content: request.system },
                  { role: "user", content: request.user },
                ],
              }
            : {
                model: settings.model,
                stream: false,
                format: "json",
                messages: [
                  { role: "system", content: request.system },
                  { role: "user", content: request.user },
                ],
              },
        ),
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") throw error;
      throw describeFetchFailure(error, url);
    }

    let data: {
      error?: string | { message?: string };
      message?: { content?: string };
      response?: string;
      choices?: Array<{ message?: { content?: string } }>;
    };
    try {
      data = (await response.json()) as typeof data;
    } catch {
      throw new Error(`Ollama returned a non-JSON response (${response.status}) from ${url}.`);
    }

    if (!response.ok) {
      const message =
        typeof data.error === "string" ? data.error : data.error?.message || `Ollama API error (${response.status})`;
      if (/not found/i.test(message)) {
        throw new Error(
          `${message} Pull it with \`ollama pull ${settings.model}\`, or switch the base URL to https://ollama.com and use an Ollama Cloud API key.`,
        );
      }
      throw new Error(message);
    }

    const text = openaiCompat
      ? data.choices?.[0]?.message?.content
      : data.message?.content || data.response;
    if (!text) throw new Error("Ollama returned an empty response.");
    return text;
  },
};
