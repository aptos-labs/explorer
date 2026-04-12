/**
 * Pure utility functions for route redirect logic.
 *
 * Extracted from route `beforeLoad` handlers so redirect decisions can be
 * unit tested without mounting the TanStack Router.
 */

import {allowsCustomNetworkForLocalExplorer} from "./walletNetwork";

export type EntityRedirectResult =
  | {kind: "tab"; tab: string; search: Record<string, string>}
  | {kind: "modules"; search: Record<string, string>}
  | {kind: "default"; tab: string; search: Record<string, string>}
  | {kind: "none"};

export function resolveEntityRedirect(
  pathname: string,
  search: {tab?: string; modulesTab?: string; network?: string},
  defaultTab: string,
): EntityRedirectResult {
  const pathSegments = pathname.split("/").filter(Boolean);
  const isExactMatch = pathSegments.length === 2;

  if (search.tab) {
    return {
      kind: "tab",
      tab: search.tab,
      search: {
        ...(search.modulesTab && {modulesTab: search.modulesTab}),
        ...(search.network && {network: search.network}),
      },
    };
  }

  if (search.modulesTab && isExactMatch) {
    return {
      kind: "modules",
      search: {
        modulesTab: search.modulesTab,
        ...(search.network && {network: search.network}),
      },
    };
  }

  if (isExactMatch) {
    return {
      kind: "default",
      tab: defaultTab,
      search: search.network ? {network: search.network} : {},
    };
  }

  return {kind: "none"};
}

export function resolveTokenLegacyRedirect(
  tab: string,
  network?: string,
): {kind: "legacy"; propertyVersion?: string; network?: string} | null {
  if (/^\d+$/.test(tab)) {
    return {
      kind: "legacy",
      propertyVersion: tab !== "0" ? tab : undefined,
      network,
    };
  }
  return null;
}

export type ValidatorRedirectResult =
  | {kind: "redirect"; tab: string; network?: string}
  | {kind: "none"};

export function resolveValidatorsRedirect(
  pathname: string,
  search: {tab?: string; network?: string},
): ValidatorRedirectResult {
  const pathSegments = pathname.split("/").filter(Boolean);
  const isExactMatch = pathSegments.length === 1;

  if (search.tab) {
    return {kind: "redirect", tab: search.tab, network: search.network};
  }

  if (isExactMatch) {
    return {kind: "redirect", tab: "all", network: search.network};
  }

  return {kind: "none"};
}

export function resolveValidatorsEnhancedRedirect(
  tab?: string,
  network?: string,
): {tab: string; network?: string} {
  return {tab: tab ?? "all", network};
}

export function resolveHeaderSearchNavigation(trimmedInput: string): {
  kind: "txn" | "account";
  value: string;
} {
  if (/^0x[a-fA-F0-9]{64}$/.test(trimmedInput)) {
    return {kind: "txn", value: trimmedInput};
  }
  if (/^\d+$/.test(trimmedInput)) {
    return {kind: "txn", value: trimmedInput};
  }
  if (/^0x[a-fA-F0-9]+$/.test(trimmedInput)) {
    return {kind: "account", value: trimmedInput};
  }
  return {kind: "account", value: trimmedInput};
}

export function shouldBlockWalletSubmission(
  walletNetworkName: string | undefined,
  explorerNetworkName: string,
  walletName: string | undefined,
  walletRpcUrl?: string,
): boolean {
  if (walletName === "Google (AptosConnect)") {
    return false;
  }
  if (
    allowsCustomNetworkForLocalExplorer(
      walletName,
      walletNetworkName,
      walletRpcUrl,
      explorerNetworkName,
    )
  ) {
    return false;
  }
  return walletNetworkName?.toLowerCase() !== explorerNetworkName.toLowerCase();
}

export type PortfolioProvider = "lightscan" | "yieldai";

export function getPortfolioUrl(
  provider: PortfolioProvider,
  address: string,
): string {
  switch (provider) {
    case "lightscan":
      return `https://aptos.lightscan.one/portfolio/${address}`;
    case "yieldai":
      return `https://yieldai.app/portfolio/${address}`;
  }
}
