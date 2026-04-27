import {useQuery} from "@tanstack/react-query";
import {getApiKey, type NetworkName, networks} from "../../lib/constants";

export type NetworkStatus = {
  healthy: boolean;
  epoch: string;
  blockHeight: string;
  ledgerVersion: string;
  chainId: string;
  frameworkVersion: number | null;
  validatorCount: number | null;
};

export async function fetchNetworkStatus(
  networkName: NetworkName,
): Promise<NetworkStatus> {
  const baseUrl = networks[networkName];
  const apiKey = getApiKey(networkName);
  const headers: Record<string, string> = apiKey
    ? {Authorization: `Bearer ${apiKey}`}
    : {};

  const res = await fetch(`${baseUrl}/`, {headers});
  if (!res.ok) throw new Error(`Fullnode returned ${res.status}`);
  type LedgerInfo = {
    epoch: number | string;
    block_height: number | string;
    ledger_version: number | string;
    chain_id: number | string;
  };
  const ledger = (await res.json()) as LedgerInfo;

  const [vResult, sResult] = await Promise.allSettled([
    fetch(`${baseUrl}/accounts/0x1/resource/0x1::version::Version`, {headers}),
    fetch(`${baseUrl}/accounts/0x1/resource/0x1::stake::ValidatorSet`, {
      headers,
    }),
  ]);

  let frameworkVersion: number | null = null;
  if (vResult.status === "fulfilled" && vResult.value.ok) {
    const v = (await vResult.value.json()) as {data: {major: string}};
    frameworkVersion = Number(v.data.major);
  }

  let validatorCount: number | null = null;
  if (sResult.status === "fulfilled" && sResult.value.ok) {
    const s = (await sResult.value.json()) as {
      data: {active_validators: unknown[]};
    };
    validatorCount = s.data.active_validators.length;
  }

  return {
    healthy: true,
    epoch: String(ledger.epoch),
    blockHeight: String(ledger.block_height),
    ledgerVersion: String(ledger.ledger_version),
    chainId: String(ledger.chain_id),
    frameworkVersion,
    validatorCount,
  };
}

export function useGetNetworkStatus(networkName: NetworkName) {
  return useQuery({
    queryKey: ["deployments", "networkStatus", networkName],
    queryFn: () => fetchNetworkStatus(networkName),
    staleTime: 60_000,
    retry: 1,
  });
}
