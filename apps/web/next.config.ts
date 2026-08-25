import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@rupert/core", "@rupert/mcp-client"],
  serverExternalPackages: ["@modelcontextprotocol/sdk"],
  agentRules: false,
};

export default nextConfig;
