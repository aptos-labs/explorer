import {useQuery} from "@tanstack/react-query";
import {ResponseError} from "../client";
import {useNetworkValue} from "../../global-config";

export function useGetProfile(
  address: string,
  options?: {retry?: number | boolean},
) {
  const networkValue = useNetworkValue();

  const result = useQuery<
    {name?: string; bio?: string; avatar_url?: string},
    ResponseError
  >({
    queryKey: ["profile", {address}, networkValue],
    queryFn: () => {
      return fetch("https://aptid.xyz/api/profile/bio?address=" + address).then(
        (res) => res.json(),
      );
    },
    retry: options?.retry ?? false,
    // Profile data is semi-static - cache for 10 minutes
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  });

  return result;
}
