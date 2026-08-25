import { readFile } from "node:fs/promises";
import { mcpConfigPath } from "@rupert/core/node";
import { z } from "zod";

export const McpServerEntrySchema = z.object({
  command: z.string().min(1),
  args: z.array(z.string()).optional().default([]),
  env: z.record(z.string(), z.string()).optional(),
  enabled: z.boolean().optional().default(true),
  allowedTools: z.array(z.string()).optional(),
  url: z.string().optional(),
});
export type McpServerEntry = z.infer<typeof McpServerEntrySchema>;

export const McpConfigSchema = z.object({
  mcpServers: z.record(z.string(), McpServerEntrySchema).default({}),
  timeoutMs: z.number().optional().default(15000),
  maxToolCalls: z.number().optional().default(6),
});
export type McpConfig = z.infer<typeof McpConfigSchema>;

export async function loadMcpConfig(path = mcpConfigPath()): Promise<McpConfig> {
  try {
    const raw = await readFile(path, "utf8");
    return McpConfigSchema.parse(JSON.parse(raw));
  } catch {
    return { mcpServers: {}, timeoutMs: 15000, maxToolCalls: 6 };
  }
}

export function enabledServers(
  config: McpConfig,
  onlyNames?: string[],
): Array<{ name: string; entry: McpServerEntry }> {
  return Object.entries(config.mcpServers)
    .filter(([name, entry]) => {
      if (entry.enabled === false) return false;
      if (onlyNames?.length) return onlyNames.includes(name);
      return true;
    })
    .map(([name, entry]) => ({ name, entry }));
}
