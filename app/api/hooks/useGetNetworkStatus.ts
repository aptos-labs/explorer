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
  const ledger = await res.json();

  let frameworkVersion: number | null = null;
  try {
    const vRes = await fetch(
      `${baseUrl}/accounts/0x1/resource/0x1::version::Version`,
      {headers},
    );
    if (vRes.ok) {
      const v = await vRes.json();
      frameworkVersion = Number((v.data as {major: string}).major);
    }
  } catch {
    // optional field — not all networks expose this
  }

  let validatorCount: number | null = null;
  try {
    const sRes = await fetch(
      `${baseUrl}/accounts/0x1/resource/0x1::stake::ValidatorSet`,
      {headers},
    );
    if (sRes.ok) {
      const s = await sRes.json();
      validatorCount = (s.data as {active_validators: unknown[]})
        .active_validators.length;
    }
  } catch {
    // optional field
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
