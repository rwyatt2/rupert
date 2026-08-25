import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { DEFAULT_SETTINGS } from "./defaults";
import { settingsPath } from "./paths";
import { ProviderSettingsSchema, type ProviderSettings } from "./types";

export { DEFAULT_MODELS, DEFAULT_SETTINGS } from "./defaults";

export async function loadSettings(): Promise<ProviderSettings> {
  try {
    const raw = await readFile(settingsPath(), "utf8");
    return ProviderSettingsSchema.parse(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: ProviderSettings): Promise<void> {
  const parsed = ProviderSettingsSchema.parse(settings);
  const path = settingsPath();
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(parsed, null, 2), "utf8");
}
