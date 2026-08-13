# Aptos Explorer auth.md

You are an agent using the **Aptos Explorer** (`https://explorer.aptoslabs.com`), a public, read-only view of the Aptos blockchain. Humans browse HTML; agents should prefer markdown and the well-known discovery files listed below.

## Audience

Autonomous agents, crawlers, and LLM tools that need to look up Aptos transactions, accounts, blocks, validators, coins, or network status. This is **not** a login wall and **not** an OAuth resource server.

## Registration

**No agent registration is required or offered.** This origin does not implement `POST /agent/auth`, does not issue access tokens, and does not publish OAuth Authorization Server metadata (`/.well-known/oauth-authorization-server` or `/.well-known/openid-configuration`).

Do not attempt Dynamic Client Registration, ID-JAG, claimed-email, or anonymous credential flows against explorer.aptoslabs.com — there is nothing to register with.

## How to use this service

1. Fetch `https://explorer.aptoslabs.com/` with `Accept: text/markdown` to receive the short LLM reference (`/llms.txt`).
2. For the full route map and API notes, fetch `/llms-full.txt`.
3. Build entity URLs from `/llms.txt` or from the Agent Skills at `/.well-known/agent-skills/index.json`.
4. If the identifier type is unknown, open `/?search={query}` and let the explorer classify it.
5. For on-chain JSON (balances, transactions, modules), use the upstream Aptos APIs listed in `/.well-known/api-catalog` — not this website's HTML. Those APIs have their own rate limits. Optional Aptos API Gateway keys are configured by **human operators** in `/settings` or via `APTOS_*_API_KEY` / `VITE_APTOS_*_API_KEY` environment variables; they authenticate to Aptos Labs API Gateway, not to the explorer origin.
6. In a WebMCP-capable browser, tools advertised in `/.well-known/mcp/server-card.json` navigate the open tab. They never sign transactions.

## Credentials

- **Explorer pages:** unauthenticated HTTPS GET/HEAD. Do not send `Authorization` to `explorer.aptoslabs.com`; the site does not consume it.
- **Wallet connect:** a browser-only, user-present flow for simulating or submitting transactions (`/run-script`, module Run). Agents must not try to complete it.
- **Secrets:** never place private keys or gateway credentials in client-exposed `VITE_*` variables that ship in the JavaScript bundle.

## Discovery

| Resource | URL |
| --- | --- |
| This document | `https://explorer.aptoslabs.com/auth.md` |
| LLM summary | `https://explorer.aptoslabs.com/llms.txt` |
| LLM full reference | `https://explorer.aptoslabs.com/llms-full.txt` |
| API catalog (RFC 9727) | `https://explorer.aptoslabs.com/.well-known/api-catalog` |
| Agent skills | `https://explorer.aptoslabs.com/.well-known/agent-skills/index.json` |
| MCP server card | `https://explorer.aptoslabs.com/.well-known/mcp/server-card.json` |
| A2A agent card | `https://explorer.aptoslabs.com/.well-known/agent-card.json` |

If anything in this file conflicts with those machine-readable documents, treat the well-known JSON as authoritative for capability flags and the LLM text files as authoritative for URL templates.
