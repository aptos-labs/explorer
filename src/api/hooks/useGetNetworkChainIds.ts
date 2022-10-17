import {NetworkName, networks} from "../../constants";
import {useQuery} from "react-query";
import {getLedgerInfoWithoutResponseError} from "..";

const TTL = 3600000; // 1 hour

function setWithExpiry(key: string, value: string, ttl: number) {
  const now = new Date();

  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };

  localStorage.setItem(key, JSON.stringify(item));
}

function getWithExpiry(key: string) {
  const itemStr = localStorage.getItem(key);

  if (!itemStr) {
    return null;
  }

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
}

export function useGetChainIdCached(networkName: NetworkName): string | null {
  return getWithExpiry(`${networkName}ChainId`);
}

export function useGetChainIdAndCache(networkName: NetworkName): string | null {
  const {data} = useQuery(["ledgerInfo", networks[networkName]], () =>
    getLedgerInfoWithoutResponseError(networks[networkName]),
  );

  const chainId = data?.chain_id ? data?.chain_id.toString() : null;

  // cache network chain ids (except local) to `localStorage` to avoid refetching chain data
  // as the chain ids for those networks won't be changed very often
  if (chainId !== null && networkName !== "local") {
    setWithExpiry(`${networkName}ChainId`, chainId, TTL);
  }

  return chainId;
}
