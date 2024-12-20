import {useQuery} from "@tanstack/react-query";
import {ResponseError} from "../client";
import {useGlobalState} from "../../global-config/GlobalConfig";

export function useGetProfile(
  address: string,
  options?: {retry?: number | boolean},
) {
  const [state] = useGlobalState();

  const result = useQuery<
    {name?: string; bio?: string; avatar_url?: string},
    ResponseError
  >({
    queryKey: ["account", {address}, state.network_value],
    queryFn: () => {
      return fetch("https://aptid.xyz/api/profile/bio?address=" + address).then(
        (res) => res.json(),
      );
    },
    retry: options?.retry ?? false,
  });

  return result;
}
