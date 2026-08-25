import type { ProviderSettings } from "../types";

export interface CompletionRequest {
  system: string;
  user: string;
  jsonMode?: boolean;
}

export interface ProviderAdapter {
  complete(settings: ProviderSettings, request: CompletionRequest): Promise<string>;
}
