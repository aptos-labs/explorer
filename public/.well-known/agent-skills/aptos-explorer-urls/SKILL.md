---
name: aptos-explorer-urls
description: Map questions about Aptos blockchain entities (transactions, accounts, blocks, validators, coins, fungible assets, NFTs, Move objects, ANS names) to canonical Aptos Explorer URLs at explorer.aptoslabs.com. Use when a user asks to look up on-chain data on Aptos, wants to share or generate an explorer link, or needs to decide between transaction version, hash, account address, ANS name, or coin type identifiers.
---

# Aptos Explorer URL Mapping

Canonical URL templates for [Aptos Explorer](https://explorer.aptoslabs.com). All paths default to mainnet; append `?network=testnet`, `?network=devnet`, or `?network=local` for other networks.

> **For crawlers / automated fetchers**: the site's `robots.txt` disallows many bots from URLs that include `?network=devnet` or `?network=local`. When generating links for indexing agents, prefer plain mainnet paths (no `network` query param); testnet links are crawlable but generally less useful for citation.

## Entity → URL template

- **Transaction**: `/txn/{version}` or `/txn/{hash}`
  - Tabs: `/txn/{id}/userTxnOverview`, `/events`, `/payload`, `/changes`, `/balanceChange`, `/trace`
- **Account**: `/account/{address}` (redirects to `/transactions`)
  - Tabs: `/transactions`, `/coins`, `/tokens`, `/resources`, `/modules`, `/multisig`, `/info`
  - Modules: `/modules/packages`, `/modules/code/{moduleName}`, `/modules/run/{moduleName}/{functionName}`, `/modules/view/{moduleName}/{functionName}`
- **Block**: `/block/{height}`; tabs `/overview`, `/transactions`
- **Validators list**: `/validators/all` | `/validators/delegation` | `/validators/enhanced_delegation`
- **Individual validator**: `/validator/{address}`
- **Coin**: `/coin/{type}` (e.g. `/coin/0x1::aptos_coin::AptosCoin`); tabs `/info`, `/transactions`, `/holders`
- **Fungible asset**: `/fungible_asset/{address}`; tabs `/info`, `/transactions`, `/holders`
- **NFT token (Digital Asset v2)**: `/token/{tokenId}`; tabs `/overview`, `/activities`
- **Move object**: `/object/{address}`; tabs `/info`, `/transactions`, `/coins`, `/tokens`, `/resources`, `/modules`
- **Releases hub**: `/releases` (redirects to default tab `networks`); tabs `/releases/networks`, `/releases/aips`, `/releases/sdks`
  - `/releases/networks` — live network deployment status, `aptos-node` git commit/version per chain, and a "Feature Flags by Network" comparison table
  - `/releases/aips` — Aptos Improvement Proposals index sourced from `aptos-foundation/AIPs`
  - `/releases/sdks` — latest stable releases for the Aptos CLI, `aptos-node`, and official SDKs
  - Legacy: `/deployments` redirects to `/releases/networks`, `/aips` redirects to `/releases/aips`
- **Lists**: `/coins`, `/blocks`, `/transactions`, `/validators`, `/analytics`, `/verification`, `/settings`
- **Filtered txns**: `/transactions?type=user&fn={entry_function_id}` (e.g. `?fn=0x1::coin::transfer`)
- **Unknown input / general search**: `/?search={query}` — pre-fills the search bar, auto-detects address / hash / ANS `.apt` / coin type.

## Identifier rules

- Addresses: 32 bytes / 64 hex chars / 0x-prefixed; short forms (`0x1`) accepted.
- Transaction version: sequential integer from 0 (primary identifier).
- Transaction hash: 0x-prefixed 64-char hex.
- Move type syntax: `{address}::{module}::{struct}<{type_params}>`.
- ANS names resolve to 32-byte addresses (e.g. `alice.apt`).
- Units: 1 APT = 100,000,000 Octas (10^8).

## Key framework addresses

- `0x1` — Aptos Framework (coin, account, staking, governance, fungible_asset)
- `0x3` — Token v1 (legacy NFT module)
- `0x4` — Token v2 / Digital Asset (current NFT standard)
- APT coin type: `0x1::aptos_coin::AptosCoin`
- APT paired fungible asset metadata: `0xa`

## Workflow

1. Classify the user's input (transaction version vs hash, account vs object, coin vs fungible asset, ANS name).
2. If ambiguous, route to `/?search={input}` and let the home search auto-detect.
3. If a specific tab is appropriate (e.g. "show modules for 0x1"), use the path-based tab, not a query param.
4. Preserve the current network if the user asked about a non-mainnet network; otherwise omit `?network=`.

See also the full reference at <https://explorer.aptoslabs.com/llms-full.txt>.
