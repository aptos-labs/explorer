import {useGlobalState} from "../../global-config/GlobalConfig";

export function useGetInTestnet(): boolean {
  const [state] = useGlobalState();
  return state.network_name === "testnet";
}
