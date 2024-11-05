import {NetworkName, networks} from "../../../constants";
import {useQuery} from "@tanstack/react-query";
import {getLedgerInfoWithoutResponseError} from "../..";
import {
  getLocalStorageWithExpiry,
  setLocalStorageWithExpiry,
} from "../../../utils";

const TTL = 3600000; // 1 hour

export function useGetChainIdCached(networkName: NetworkName): string | null {
  return getLocalStorageWithExpiry(`${networkName}ChainId`);
}

export function useGetChainIdAndCache(networkName: NetworkName): string | null {
  const {data} = useQuery({
    queryKey: ["ledgerInfo", networks[networkName]],
    queryFn: () => getLedgerInfoWithoutResponseError(networks[networkName]),
  });

  const chainId = data?.chain_id ? data?.chain_id.toString() : null;

  // cache network chain ids (except local) to `localStorage` to avoid refetching chain data
  // as the chain ids for those networks won't be changed very often
  if (chainId !== null && networkName !== "local") {
    setLocalStorageWithExpiry(`${networkName}ChainId`, chainId, TTL);
  }

  return chainId;
}
