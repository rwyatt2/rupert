import {
  DEFAULT_MODELS,
  DEFAULT_OLLAMA_CLOUD_MODEL,
  OLLAMA_CLOUD_URL,
  OLLAMA_LOCAL_URL,
} from "../defaults";
import type { ProviderSettings } from "../types";
import type { ProviderAdapter } from "./types";

export function isOllamaCloud(baseUrl?: string): boolean {
  try {
    const host = new URL(normalizeOllamaInput(baseUrl)).hostname;
    return host === "ollama.com" || host.endsWith(".ollama.com");
  } catch {
    return /ollama\.com/i.test(baseUrl || "");
  }
}

export function isLocalOllama(baseUrl?: string): boolean {
  if (!baseUrl?.trim()) return true;
  try {
    const host = new URL(normalizeOllamaInput(baseUrl)).hostname;
    return host === "127.0.0.1" || host === "localhost";
  } catch {
    return /127\.0\.0\.1|localhost/i.test(baseUrl);
  }
}

function isLocalDefaultModel(model: string): boolean {
  const name = model.trim().toLowerCase();
  return name === DEFAULT_MODELS.ollama || name === `${DEFAULT_MODELS.ollama}:latest`;
}

export function resolveOllamaSettings(settings: ProviderSettings): ProviderSettings {
  if (settings.provider !== "ollama") return settings;
  const apiKey = settings.apiKey.trim();
  let customBaseUrl = settings.customBaseUrl;
  let model = settings.model;

  if (apiKey && isLocalOllama(customBaseUrl)) {
    customBaseUrl = OLLAMA_CLOUD_URL;
  }

  if (isOllamaCloud(customBaseUrl) && isLocalDefaultModel(model)) {
    model = DEFAULT_OLLAMA_CLOUD_MODEL;
  }

  return { ...settings, apiKey, customBaseUrl, model };
}

function looksLikeApiKey(value: string): boolean {
  return value.length >= 20 && !value.includes(".") && !value.includes("/") && !value.includes(":");
}

function normalizeOllamaInput(raw?: string): string {
  let input = (raw || OLLAMA_LOCAL_URL).trim() || OLLAMA_LOCAL_URL;
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
        `Could not reach local Ollama at ${target}. Start the Ollama app (or \`ollama serve\`), or paste an API key from ollama.com/settings/keys to use Ollama Cloud.`,
      );
    }
    return new Error(`Could not reach Ollama at ${target}. Check the base URL.`);
  }

  const detail = [...codes, ...messages.filter((m) => m !== "fetch failed")].join(" — ") || "fetch failed";
  return new Error(`Ollama request to ${target} failed: ${detail}`);
}

function contentText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "";
  return JSON.stringify(value);
}

export const ollamaAdapter: ProviderAdapter = {
  async complete(settings, request) {
    const resolved = resolveOllamaSettings(settings);
    const { url, openaiCompat } = resolveChatUrl(resolved.customBaseUrl);
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const apiKey = resolved.apiKey;
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
                model: resolved.model,
                response_format: { type: "json_object" },
                messages: [
                  { role: "system", content: request.system },
                  { role: "user", content: request.user },
                ],
              }
            : {
                model: resolved.model,
                stream: false,
                format: "json",
                ...(isOllamaCloud(resolved.customBaseUrl) ? { think: false } : {}),
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
      message?: { content?: unknown };
      response?: unknown;
      choices?: Array<{ message?: { content?: unknown } }>;
    };
    try {
      data = (await response.json()) as typeof data;
    } catch {
      throw new Error(`Ollama returned a non-JSON response (${response.status}) from ${url}.`);
    }

    if (!response.ok) {
      const message =
        typeof data.error === "string" ? data.error : data.error?.message || `Ollama API error (${response.status})`;
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          `Ollama Cloud rejected the API key (${response.status}). Create a key at ollama.com/settings/keys and paste it in Settings.`,
        );
      }
      if (/not found/i.test(message)) {
        if (isOllamaCloud(resolved.customBaseUrl)) {
          throw new Error(
            `${message} "${resolved.model}" is not available on Ollama Cloud. Use ${DEFAULT_OLLAMA_CLOUD_MODEL}, gemma4:31b, or another model from ollama.com/search?c=cloud.`,
          );
        }
        throw new Error(
          `${message} Pull it with \`ollama pull ${resolved.model}\`, or paste an Ollama Cloud API key to use ${DEFAULT_OLLAMA_CLOUD_MODEL}.`,
        );
      }
      throw new Error(message);
    }

    const text = openaiCompat
      ? contentText(data.choices?.[0]?.message?.content)
      : contentText(data.message?.content) || contentText(data.response);
    if (!text) throw new Error("Ollama returned an empty response.");
    return text;
  },
};
