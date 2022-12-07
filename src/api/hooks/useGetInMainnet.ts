import {useGlobalState} from "../../GlobalState";

// TODO: replace existing mainnet checks across the code base with this hook
export function useGetInMainnet(): boolean {
  const [state, _] = useGlobalState();
  return state.network_name === "mainnet";
}
