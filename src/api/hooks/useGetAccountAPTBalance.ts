import {useGetAccountResources} from "./useGetAccountResources";

interface CoinStore {
  coin: {
    value: string;
  };
}

export function useGetAccountAPTBalance(address: string) {
  const {isLoading, data, error} = useGetAccountResources(address);

  if (isLoading || error || !data) {
    return null;
  }

  const coinStore = data.find(
    (resource) =>
      resource.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
  );

  if (!coinStore) {
    return null;
  }

  const coinStoreData: CoinStore = coinStore.data as CoinStore;

  return coinStoreData?.coin?.value;
}
