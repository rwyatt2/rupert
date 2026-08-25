import type { ProviderAdapter } from "./types";

export const googleAdapter: ProviderAdapter = {
  async complete(settings, request) {
    const model = encodeURIComponent(settings.model);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(settings.apiKey)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      throw new Error(data.error?.message || `Google API error (${response.status})`);
    }
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("");
    if (!text) throw new Error("Google returned an empty response.");
    return text;
  },
};
