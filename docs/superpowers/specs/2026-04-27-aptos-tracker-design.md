# Aptos Deployment Tracker — Design Spec

**Date:** 2026-04-27
**Author:** Greg Nazario
**Status:** Approved

---

## Overview

Add three new pages to `explorer.aptoslabs.com` that give engineers and ecosystem participants a single place to see:

- Live on-chain state across all three networks (devnet, testnet, mainnet)
- All Aptos Improvement Proposals (AIPs) with their current status
- Latest release versions for the CLI, node software, and all official SDKs

This is built directly in `aptos-labs/explorer` using the existing stack (TanStack Router, TanStack Query, MUI v7, TypeScript, Vite).

---

## Routes

| URL | Route file | Page component |
|---|---|---|
| `/deployments` | `app/routes/deployments.tsx` | `app/pages/Deployments/Index.tsx` |
| `/aips` | `app/routes/aips.tsx` | `app/pages/AIPs/Index.tsx` |
| `/releases` | `app/routes/releases.tsx` | `app/pages/Releases/Index.tsx` |

All three are added to `app/components/layout/Nav.tsx` and `app/components/layout/NavMobile.tsx`.

---

## Section 1: /deployments — Network Status

### Purpose
Show all three Aptos networks side-by-side. This page **ignores** the global `?network=` selector — it always displays devnet, testnet, and mainnet simultaneously.

### Layout
3-column MUI `Grid` (collapses to 1 column on mobile). One `Card` per network.

### Data per card
| Field | Source |
|---|---|
| Health (up/down) | HTTP response success from fullnode `/` |
| Epoch | `getLedgerInfo()` → `epoch` |
| Block height | `getLedgerInfo()` → `block_height` |
| Ledger version | `getLedgerInfo()` → `ledger_version` |
| Chain ID | `getLedgerInfo()` → `chain_id` |
| Framework version | `GET /accounts/0x1/resource/0x1::version::Version` → `data.major` |
| Validator count | Reuse `useGetValidatorSet` logic (already exists) |

### Caching
- `staleTime: 60_000` (1 minute)
- "Refresh All" button calls `queryClient.invalidateQueries({ queryKey: ["deployments"] })`

### Error handling
Each network card is an independent query. One network failing shows an error state on that card only; the other two render normally.

### Hooks
- `useGetNetworkStatus(network: Network)` — new hook, runs three instances in parallel (one per network)
- `useGetFrameworkVersion(network: Network)` — new hook, fetches `0x1::version::Version` resource

---

## Section 2: /aips — AIP Tracker

### Purpose
List all Aptos Improvement Proposals with number, title, status, author, and a link to the source on GitHub.

### Layout
MUI `Table` (sortable columns) with a status filter chip bar above. No pagination needed for initial launch.

### Columns
| Column | Source |
|---|---|
| AIP # | Parsed from filename (`aip-42.md` → `42`) |
| Title | YAML frontmatter `title:` |
| Status | YAML frontmatter `status:` (Draft, Last Call, Final, Withdrawn, Living) |
| Author | YAML frontmatter `author:` |
| Link | GitHub URL to the file |

### Data source
GitHub API via a TanStack Start **server function** (`createServerFn`):
1. `GET /repos/aptos-foundation/AIPs/git/trees/main?recursive=1` — list all `aip-*.md` files
2. Fetch each file's raw content to parse YAML frontmatter

Server function allows use of a server-side `GITHUB_TOKEN` env var, avoiding the 60 req/hr anonymous rate limit.

### Caching
- `staleTime: 5 * 60_000` (5 minutes)
- "Refresh" button invalidates `["aips"]` query key

### Error handling
- GitHub rate limit (403) → user-visible banner: "Rate limited — try again in a few minutes"
- Network error → standard error state with retry button

---

## Section 3: /releases — SDK & Tool Releases

### Purpose
Show the latest release version for every official Aptos tool and SDK in one place.

### Layout
MUI `Grid` of cards — one card per tool/SDK.

### Tools tracked
| Tool | Registry | API endpoint | Link target |
|---|---|---|---|
| Aptos CLI | GitHub Releases | `GET /repos/aptos-labs/aptos-core/releases` → filter `aptos-cli-v*` | GitHub release page |
| aptos-node | GitHub Releases | `GET /repos/aptos-labs/aptos-core/releases` → filter `aptos-node-v*` | GitHub release page |
| TypeScript SDK | npm | `GET https://registry.npmjs.org/@aptos-labs/ts-sdk/latest` → `version` | npmjs.com package page |
| Python SDK | PyPI | `GET https://pypi.org/pypi/aptos-sdk/json` → `info.version` | pypi.org package page |
| Rust SDK | crates.io | `GET https://crates.io/api/v1/crates/aptos-sdk` → `crate.newest_version` | crates.io package page |
| Go SDK | Go proxy | `GET https://proxy.golang.org/github.com/aptos-labs/aptos-go-sdk/@latest` → `Version` | pkg.go.dev page |

CLI and node use GitHub releases (binaries, no package registry). SDKs use their respective package registries as the source of truth.

### Data per card
- Tool name + icon
- Latest version tag
- Release date (relative: "3 days ago")
- Link to registry/release page

### Data source
A single `createServerFn` batches all fetches. npm, PyPI, crates.io, and Go proxy calls need no auth token. GitHub calls for CLI/node/Unity/Swift use the server-side `GITHUB_TOKEN` if set.

### Caching
- `staleTime: 5 * 60_000` (5 minutes)
- "Refresh" button invalidates `["releases"]` query key

### Error handling
- Individual repo fetch failure shows an error state on that card only
- GitHub rate limit → user-visible banner

---

## Environment Variables

| Variable | Purpose | Visibility | Recommended use |
|---|---|---|---|
| `VITE_GITHUB_TOKEN` | GitHub API auth (avoids the 60 req/hr unauthenticated rate limit) | Client-visible (browser bundle) | **Local development only.** Never set in a deployed environment. |

> **Implementation note:** The spec originally proposed a server-only `GITHUB_TOKEN` via `createServerFn`. The explorer is a pure Vite SPA — `createServerFn` is not available. `VITE_GITHUB_TOKEN` follows the existing `VITE_APTOS_*_API_KEY` env-var pattern in the codebase, but unlike the Aptos API gateway keys (which are public client identifiers), a GitHub PAT is a **secret credential** that can be exfiltrated and abused once it ships in client JS (rate-limit burning, account attribution, repo/org enumeration). The repository's `.env.example` therefore restricts `VITE_GITHUB_TOKEN` to local-dev use only. Production should rely on unauthenticated GitHub requests with graceful rate-limit handling, or proxy through a server-side function if authenticated access becomes necessary.

---

## Files to Create

```
app/routes/deployments.tsx
app/routes/aips.tsx
app/routes/releases.tsx
app/pages/Deployments/Index.tsx
app/pages/AIPs/Index.tsx
app/pages/Releases/Index.tsx
app/api/hooks/useGetNetworkStatus.ts  (useGetFrameworkVersion merged in here)
app/api/hooks/useGetAIPs.ts
app/api/hooks/useGetReleases.ts
app/api/server/github.ts          (createServerFn for GitHub API)
```

## Files to Modify

```
app/components/layout/Nav.tsx       (add 3 nav buttons)
app/components/layout/NavMobile.tsx (add 3 nav buttons)
app/routeTree.gen.ts                (auto-generated, run pnpm routes:generate)
```

---

## Out of Scope

- Real-time WebSocket streaming (polling via staleTime is sufficient)
- Historical charts of network metrics
- AIP comment/discussion integration
- Authentication or user accounts
