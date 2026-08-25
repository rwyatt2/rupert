# Rupert Viability Engine

Adversarial idea stress-testing. Zero sycophancy. Local-first. Bring your own keys.

Surfaces share one evaluation core:

- Next.js scorecard (`apps/web`)
- `rupert` CLI (`apps/cli`)
- Cursor MCP server (`apps/mcp-server`)
- Obsidian plugin (`apps/obsidian`)

## Setup

Requires Node 22+ and pnpm.

```bash
pnpm install
pnpm web
```

Open [http://localhost:3000](http://localhost:3000). Set a provider and API key in the top-right. Keys stay in `localStorage` and are sent only to the local Next.js route.

CLI and MCP settings live in `~/.rupert/settings.json`. History is `~/.rupert/history/`.

```bash
pnpm cli -- config --provider anthropic --model claude-sonnet-4-5 --key "$ANTHROPIC_API_KEY"
pnpm cli -- evaluate --file examples/idea.json
pnpm cli -- history
```

## Cursor MCP server

Add this to your Cursor MCP config:

```json
{
  "mcpServers": {
    "rupert": {
      "command": "pnpm",
      "args": ["--filter", "@rupert/mcp-server", "start"],
      "cwd": "/absolute/path/to/Rupert"
    }
  }
}
```

Tools: `evaluate_idea`, `list_evaluations`, `get_evaluation`, `export_evaluation`, `get_rubric`.

Pass `priorEvidence` if you already researched with other MCPs. Set `useMcpEvidence` only if you also want Rupert to query `~/.rupert/mcp.json`.

## Optional MCP evidence

Copy `examples/mcp.json` to `~/.rupert/mcp.json` and add servers (same `command` / `args` / `env` shape as Cursor). Off by default. Fail-open if a server is down.

## Obsidian

```bash
pnpm obsidian:build
```

Copy `apps/obsidian/manifest.json` and `apps/obsidian/main.js` into `<vault>/.obsidian/plugins/rupert-viability/`. Command: **Rupert: Stress-test this note**. See `examples/obsidian-idea.md` for frontmatter.

## Scoring

Seven weighted dimensions. Any triggered kill (thin wrapper, unreachable buyer, inverted unit economics, platform trap) is a hard no-go regardless of the raw score. The host recomputes the composite score after the model responds.
