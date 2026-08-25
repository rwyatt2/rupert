import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@rupert/core", "@rupert/mcp-client"],
  serverExternalPackages: ["@modelcontextprotocol/sdk"],
  outputFileTracingRoot: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.."),
  agentRules: false,
};

export default nextConfig;
