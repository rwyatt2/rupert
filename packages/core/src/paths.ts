import { homedir } from "node:os";
import { join } from "node:path";

export function rupertHome(): string {
  return process.env.RUPERT_HOME || join(homedir(), ".rupert");
}

export function settingsPath(): string {
  return join(rupertHome(), "settings.json");
}

export function historyDir(): string {
  return join(rupertHome(), "history");
}

export function mcpConfigPath(): string {
  return join(rupertHome(), "mcp.json");
}
