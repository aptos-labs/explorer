import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {getAccountResource} from "../v2";
import {ResponseError} from "../client";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {orderBy} from "lodash";
import {MoveResource} from "@aptos-labs/ts-sdk";

export type ModuleMetadata = {
  name: string;
  source: string;
};

export type PackageMetadata = {
  name: string;
  modules: ModuleMetadata[];
};

export function useGetAccountResource(
  address: string,
  resource: `${string}::${string}::${string}`,
): UseQueryResult<MoveResource, ResponseError> {
  const [state] = useGlobalState();

  return useQuery<MoveResource, ResponseError>({
    queryKey: ["accountResource", {address, resource}, state.network_value],
    queryFn: () =>
      getAccountResource(
        {address, resourceType: resource},
        state.sdk_v2_client,
      ),
    refetchOnWindowFocus: false,
  });
}

export function useGetAccountPackages(address: string) {
  const {data: registry} = useGetAccountResource(
    address,
    "0x1::code::PackageRegistry",
  );

  const registryData = registry?.data as {
    packages?: PackageMetadata[];
  };

  const packages: PackageMetadata[] =
    registryData?.packages?.map((pkg): PackageMetadata => {
      const sortedModules = orderBy(pkg.modules, "name");
      return {name: pkg.name, modules: sortedModules};
    }) || [];

  return orderBy(packages, "name");
}
