import {useGlobalState} from "../../global-config/GlobalConfig";

export function useGetInDevMode(): boolean {
  const [state, _] = useGlobalState();
  return state.feature_name && state.feature_name === "dev";
}
