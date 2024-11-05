import {useGlobalState} from "../../../global-config/GlobalConfig";

// TODO: replace existing mainnet checks across the code base with this hook
export function useGetInMainnet(): boolean {
  const [state] = useGlobalState();
  return state.network_name === "mainnet";
}
