---
name: aptos-explorer-search
description: Use the Aptos Explorer home-page search URL at explorer.aptoslabs.com/?search={query} to look up any Aptos-chain identifier whose type you do not know (address, transaction hash/version, ANS .apt name, coin or fungible asset type, block height). Use when a user pastes an opaque on-chain string, asks "what is this?", or you want the explorer to auto-detect and route to the correct entity page.
---

# Aptos Explorer — universal search

The explorer's home page accepts a `search` query parameter that auto-detects entity type and shows matching results inline, grouped by type (accounts, transactions, blocks, coins, fungible assets, ANS names).

## URL

```
https://explorer.aptoslabs.com/?search={query}
```

## Behavior

- On load, the query is run immediately.
- Results are grouped by entity type and displayed on the home page.
- If exactly one unambiguous entity matches, the explorer navigates directly to that page.
- If nothing matches, the page surfaces "no results" for the classified type.

## When to use

- The user pastes a hex string that could be an address, transaction hash, or block hash.
- The user types an ANS name (e.g. `alice.apt`) that needs resolving.
- The user gives a fully-qualified Move type (e.g. `0x1::aptos_coin::AptosCoin`) without saying whether they want the coin page or the fungible asset page.
- The user's intent is general (e.g. "look up X on Aptos") and you don't need to route to a specific tab.

## When not to use

Prefer a direct path when you already know the entity type:
- Transaction by version or hash → `/txn/{id}`
- Account by address → `/account/{address}`
- Block by height → `/block/{height}`
- Coin by type → `/coin/{type}`
- Fungible asset by metadata address → `/fungible_asset/{address}`
- Move object → `/object/{address}`

## Network selection

Append `?network=testnet|devnet|local` alongside `search` to search a non-mainnet network:

```
https://explorer.aptoslabs.com/?search={query}&network=testnet
```

Do **not** add a network parameter when generating links for AI crawlers — see the explorer's `robots.txt`.
