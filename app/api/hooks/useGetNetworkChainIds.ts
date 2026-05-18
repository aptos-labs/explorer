import {useQuery} from "@tanstack/react-query";
import {type NetworkName, networks} from "../../constants";
import {getCachedV2Client} from "../../global-config";
import {
  getLocalStorageWithExpiry,
  setLocalStorageWithExpiry,
} from "../../utils";

const TTL = 3600000; // 1 hour

export function useGetChainIdCached(networkName: NetworkName): string | null {
  return getLocalStorageWithExpiry(`${networkName}ChainId`);
}

export function useGetChainIdAndCache(networkName: NetworkName): string | null {
  const {data} = useQuery({
    queryKey: ["ledgerInfo", networks[networkName]],
    queryFn: async () => {
      const client = getCachedV2Client(networkName);
      return client.getLedgerInfo();
    },
    staleTime: TTL,
    gcTime: TTL,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const chainId = data?.chain_id ? data?.chain_id.toString() : null;

  if (chainId !== null && networkName !== "local") {
    setLocalStorageWithExpiry(`${networkName}ChainId`, chainId, TTL);
  }

  return chainId;
}
