import {useNetworkName} from "../../global-config";

// TODO: replace existing mainnet checks across the code base with this hook
export function useGetInMainnet(): boolean {
  const networkName = useNetworkName();
  return networkName === "mainnet";
}
