/**
 * Pure definitions for the WebMCP tools exposed by the Explorer.
 * Consumed by WebMCPProvider at runtime and unit-tested separately.
 *
 * Each tool is read-only and only performs in-app navigation; no tool
 * signs a transaction or mutates chain state.
 */

export type NetworkName = "mainnet" | "testnet" | "devnet" | "local";

export type NavigateFn = (options: {
  to: string;
  search?: Record<string, string>;
}) => Promise<void> | void;

export type WebMCPTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema?: object;
  execute: (input: unknown) => Promise<{ok: true; path: string}>;
  annotations?: {readOnlyHint?: boolean};
};

const HEX_ADDRESS_RE = /^0x[0-9a-fA-F]{1,64}$/;
const ANS_NAME_RE = /^[a-z0-9-]{1,63}\.apt$/;
const MOVE_TYPE_RE =
  /^0x[0-9a-fA-F]+::[A-Za-z_][A-Za-z0-9_]*::[A-Za-z_][A-Za-z0-9_]*/;

const NETWORK_DESCRIPTION =
  "Aptos network. When set, the tool navigates to this network explicitly (including mainnet, which will override a previously selected testnet/devnet/local). When omitted, the explorer preserves the user's current network.";

export function isAddressLike(value: string): boolean {
  return HEX_ADDRESS_RE.test(value) || ANS_NAME_RE.test(value);
}

/**
 * Build the `search` object passed to the router for a given network choice.
 *
 * The explorer's `useNavigate` wrapper preserves the current `?network=`
 * whenever the caller omits `search.network`. That means passing
 * `{network: undefined}` keeps the user on their current network, while
 * passing `{network: "mainnet"}` explicitly switches them to mainnet. For
 * that reason we forward every explicitly-provided network (including
 * `"mainnet"`) rather than dropping it.
 */
export function networkSearch(
  network: NetworkName | undefined,
): Record<string, string> {
  if (!network) return {};
  return {network};
}

function buildPath(to: string, search: Record<string, string>): string {
  const entries = Object.entries(search);
  if (entries.length === 0) return to;
  const qs = new URLSearchParams(entries).toString();
  return `${to}?${qs}`;
}

const NETWORK_SCHEMA = {
  type: "string",
  enum: ["mainnet", "testnet", "devnet", "local"],
  description: NETWORK_DESCRIPTION,
} as const;

export function buildWebMcpTools(navigate: NavigateFn): WebMCPTool[] {
  return [
    {
      name: "search_explorer",
      title: "Search Aptos Explorer",
      description:
        "Route the explorer's home-page search to an on-chain entity. The home search auto-detects addresses, transaction versions or hashes, ANS (.apt) names, coin types, and block heights, and shows inline results. Use when the user has an opaque identifier and you don't know the entity type.",
      inputSchema: {
        type: "object",
        required: ["query"],
        additionalProperties: false,
        properties: {
          query: {
            type: "string",
            minLength: 1,
            description:
              "Free-form input to search for (address, transaction hash/version, ANS name, coin type, or block height).",
          },
          network: NETWORK_SCHEMA,
        },
      },
      annotations: {readOnlyHint: true},
      execute: async (input) => {
        const {query, network} =
          (input as {query?: string; network?: NetworkName}) ?? {};
        if (typeof query !== "string" || query.length === 0) {
          throw new Error("search_explorer: 'query' is required");
        }
        const search = {search: query, ...networkSearch(network)};
        await navigate({to: "/", search});
        return {ok: true, path: buildPath("/", search)};
      },
    },
    {
      name: "open_transaction",
      title: "Open transaction",
      description:
        "Open the Aptos Explorer transaction page for a given version number (integer) or transaction hash (0x-prefixed 64-char hex). Optional tab selects which detail view to show.",
      inputSchema: {
        type: "object",
        required: ["id"],
        additionalProperties: false,
        properties: {
          id: {
            type: "string",
            description:
              "Transaction version (digits) or hash (0x-prefixed hex).",
          },
          tab: {
            type: "string",
            enum: [
              "userTxnOverview",
              "events",
              "payload",
              "changes",
              "balanceChange",
              "trace",
            ],
          },
          network: NETWORK_SCHEMA,
        },
      },
      annotations: {readOnlyHint: true},
      execute: async (input) => {
        const {id, tab, network} =
          (input as {
            id?: string;
            tab?: string;
            network?: NetworkName;
          }) ?? {};
        if (typeof id !== "string" || id.length === 0) {
          throw new Error("open_transaction: 'id' is required");
        }
        const isVersion = /^\d+$/.test(id);
        // Transaction hashes are SHA3-256 → 32 bytes → 64 hex chars.
        // Keep this strict so the tool never produces a /txn/{id} URL for
        // shapes the explorer's search would not classify as a hash.
        const isHash = /^0x[0-9a-fA-F]{64}$/.test(id);
        if (!isVersion && !isHash) {
          throw new Error(
            "open_transaction: 'id' must be a decimal version or a 0x-prefixed 64-char hex hash",
          );
        }
        const to = tab ? `/txn/${id}/${tab}` : `/txn/${id}`;
        const search = networkSearch(network);
        await navigate({to, search});
        return {ok: true, path: buildPath(to, search)};
      },
    },
    {
      name: "open_account",
      title: "Open account",
      description:
        "Open the Aptos Explorer account page for a given 0x-prefixed address or ANS .apt name. Optional tab selects the account view (transactions, coins, tokens, resources, modules, info, multisig).",
      inputSchema: {
        type: "object",
        required: ["address"],
        additionalProperties: false,
        properties: {
          address: {
            type: "string",
            description: "0x-prefixed account address or .apt name",
          },
          tab: {
            type: "string",
            enum: [
              "transactions",
              "coins",
              "tokens",
              "resources",
              "modules",
              "multisig",
              "info",
            ],
          },
          network: NETWORK_SCHEMA,
        },
      },
      annotations: {readOnlyHint: true},
      execute: async (input) => {
        const {address, tab, network} =
          (input as {
            address?: string;
            tab?: string;
            network?: NetworkName;
          }) ?? {};
        if (typeof address !== "string" || !isAddressLike(address)) {
          throw new Error(
            "open_account: 'address' must be a 0x-prefixed hex address or .apt name",
          );
        }
        const to = tab ? `/account/${address}/${tab}` : `/account/${address}`;
        const search = networkSearch(network);
        await navigate({to, search});
        return {ok: true, path: buildPath(to, search)};
      },
    },
    {
      name: "open_block",
      title: "Open block",
      description:
        "Open the Aptos Explorer block page for a given block height (non-negative integer).",
      inputSchema: {
        type: "object",
        required: ["height"],
        additionalProperties: false,
        properties: {
          height: {
            type: "integer",
            minimum: 0,
            description: "Block height",
          },
          network: NETWORK_SCHEMA,
        },
      },
      annotations: {readOnlyHint: true},
      execute: async (input) => {
        const {height, network} =
          (input as {height?: number; network?: NetworkName}) ?? {};
        if (
          typeof height !== "number" ||
          !Number.isInteger(height) ||
          height < 0
        ) {
          throw new Error(
            "open_block: 'height' must be a non-negative integer",
          );
        }
        const to = `/block/${height}`;
        const search = networkSearch(network);
        await navigate({to, search});
        return {ok: true, path: buildPath(to, search)};
      },
    },
    {
      name: "open_coin",
      title: "Open coin",
      description:
        "Open the Aptos Explorer coin page for a fully-qualified Move coin type (address::module::struct). For example, 0x1::aptos_coin::AptosCoin for native APT.",
      inputSchema: {
        type: "object",
        required: ["coinType"],
        additionalProperties: false,
        properties: {
          coinType: {
            type: "string",
            description: "Move coin type, e.g. 0x1::aptos_coin::AptosCoin",
          },
          network: NETWORK_SCHEMA,
        },
      },
      annotations: {readOnlyHint: true},
      execute: async (input) => {
        const {coinType, network} =
          (input as {coinType?: string; network?: NetworkName}) ?? {};
        if (typeof coinType !== "string" || !MOVE_TYPE_RE.test(coinType)) {
          throw new Error(
            "open_coin: 'coinType' must be a fully-qualified Move type like 0x1::aptos_coin::AptosCoin",
          );
        }
        const to = `/coin/${encodeURIComponent(coinType)}`;
        const search = networkSearch(network);
        await navigate({to, search});
        return {ok: true, path: buildPath(to, search)};
      },
    },
  ];
}
