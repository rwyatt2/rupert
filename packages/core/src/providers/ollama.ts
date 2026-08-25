import type { ProviderAdapter } from "./types";

export const ollamaAdapter: ProviderAdapter = {
  async complete(settings, request) {
    const base = (settings.customBaseUrl || "http://127.0.0.1:11434").replace(/\/$/, "");
    const url = base.endsWith("/api/chat") ? base : `${base}/api/chat`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: settings.model,
        stream: false,
        format: "json",
        messages: [
          { role: "system", content: request.system },
          { role: "user", content: request.user },
        ],
      }),
    });
    const data = (await response.json()) as {
      error?: string;
      message?: { content?: string };
      response?: string;
    };
    if (!response.ok) {
      throw new Error(data.error || `Ollama API error (${response.status})`);
    }
    const text = data.message?.content || data.response;
    if (!text) throw new Error("Ollama returned an empty response.");
    return text;
  },
};
