import type { ProviderSettings } from "../types";
import type { CompletionRequest, ProviderAdapter } from "./types";

async function completeOpenAICompat(
  url: string,
  settings: ProviderSettings,
  request: CompletionRequest,
  extraHeaders?: Record<string, string>,
): Promise<string> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model: settings.model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: request.system },
        { role: "user", content: request.user },
      ],
    }),
  });
  const data = (await response.json()) as {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string } }>;
  };
  if (!response.ok) {
    throw new Error(data.error?.message || `OpenAI-compatible API error (${response.status})`);
  }
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Provider returned an empty response.");
  return text;
}

export const openaiAdapter: ProviderAdapter = {
  complete(settings, request) {
    return completeOpenAICompat("https://api.openai.com/v1/chat/completions", settings, request);
  },
};

export const openrouterAdapter: ProviderAdapter = {
  complete(settings, request) {
    return completeOpenAICompat("https://openrouter.ai/api/v1/chat/completions", settings, request, {
      "HTTP-Referer": "https://rupert.local",
      "X-Title": "Rupert Viability Engine",
    });
  },
};
