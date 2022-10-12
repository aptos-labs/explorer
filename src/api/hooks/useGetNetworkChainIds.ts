import {NetworkName, networks} from "../../constants";
import {useQuery} from "react-query";
import {getLedgerInfo} from "..";

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

export default function useGetNetworkChainIds() {
  const networkChainIds = Object.fromEntries(
    Object.entries(networks).map(([networkName, _networkValue]) => {
      // save chain ids for networks other than local to `localStorage` to avoid refetching chain data
      // as the chain ids for those networks won't be changed very often
      if (networkName !== "local" && getWithExpiry(`${networkName}ChainId`)) {
        return [networkName, getWithExpiry(`${networkName}ChainId`)];
      }

      const {data} = useQuery(
        ["ledgerInfo", networks[networkName as NetworkName]],
        () => getLedgerInfo(networks[networkName as NetworkName]),
      );
      const chainId: string | null = data?.chain_id
        ? data?.chain_id.toString()
        : null;

      if (networkName !== "local" && chainId !== null) {
        setWithExpiry(
          `${networkName}ChainId`,
          chainId,
          3600000, // ttl is 1 hour
        );
      }

      return [networkName, chainId];
    }),
  );

  return networkChainIds;
}
