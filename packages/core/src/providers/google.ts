import type { ProviderAdapter } from "./types";

export const googleAdapter: ProviderAdapter = {
  async complete(settings, request) {
    const model = encodeURIComponent(settings.model);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(settings.apiKey)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: request.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: request.system }] },
        contents: [{ role: "user", parts: [{ text: request.user }] }],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 8000,
        },
      }),
    });
    const data = (await response.json()) as {
      error?: { message?: string };
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    if (!response.ok) {
      const message = data.error?.message || `Google API error (${response.status})`;
      if (/high demand|try again later|resource exhausted|429|503/i.test(message) || response.status === 429 || response.status === 503) {
        throw new Error(
          `${message} Try gemini-3.5-flash in settings — it is usually less busy — or wait a minute and retry.`,
        );
      }
      throw new Error(message);
    }
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("");
    if (!text) throw new Error("Google returned an empty response.");
    return text;
  },
};
