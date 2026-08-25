# Rupert Viability Engine

Adversarial idea stress-testing. Zero sycophancy. Local-first. Bring your own keys.

Surfaces share one evaluation core:

- Next.js scorecard (`apps/web`)
- `rupert` CLI (`apps/cli`)
- Cursor MCP server (`apps/mcp-server`)
- Obsidian plugin (`apps/obsidian`)

## Setup

Requires Node 22+ and pnpm. The web app uses [Clerk](https://clerk.com) for sign-in.

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
```

Create a Clerk application and enable **Email verification code**, **Google**, and **GitHub**. Paste the keys into `apps/web/.env.local`. Keep first/last name optional and leave passwords off so the email-code flow matches the sign-in page. For a local-only instance you can run `npx clerk@latest init` from `apps/web` instead.

```bash
pnpm web
```

Open [http://localhost:3000](http://localhost:3000), sign in, then set a provider and API key in Settings. Keys stay in this browser, namespaced to your Clerk user, and are sent only with the current evaluation request.

## Host on Vercel

Deploy the Next.js app in `apps/web`. Rupert does not ship shared model keys — each signed-in user pastes **their own** provider key in Settings.

1. Push this repo to GitHub (the Vercel project tracks git, not uncommitted files).
2. [Import the repo](https://vercel.com/new) on Vercel.
3. Set **Root Directory** to `apps/web`. Leave **Include source files outside of the Root Directory** on so `@rupert/core` and `@rupert/mcp-client` are available.
4. Framework Preset: Next.js. Node.js: 22.x.
5. Add the Clerk env vars from `apps/web/.env.example` (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and the sign-in URLs). Add your production origin to the Clerk allowed origins / redirect URLs.

MCP evidence and local Ollama (`127.0.0.1`) are local-only. History on Vercel stays in the browser. Evaluations may run up to 5 minutes.

```bash
pnpm --filter @rupert/web build
```

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
