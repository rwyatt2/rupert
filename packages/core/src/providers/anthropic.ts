import type { ProviderAdapter } from "./types";

export const anthropicAdapter: ProviderAdapter = {
  async complete(settings, request) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": settings.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: settings.model,
        max_tokens: 8000,
        system: `${request.system}\n\nCRITICAL: Respond ONLY with valid JSON. No conversational text.`,
        messages: [{ role: "user", content: request.user }],
      }),
    });
    const data = (await response.json()) as {
      error?: { message?: string };
      content?: Array<{ text?: string }>;
    };
    if (!response.ok) {
      throw new Error(data.error?.message || `Anthropic API error (${response.status})`);
    }
    const text = data.content?.[0]?.text;
    if (!text) throw new Error("Anthropic returned an empty response.");
    return text;
  },
};
