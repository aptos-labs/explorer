import {type UseQueryResult, useQuery} from "@tanstack/react-query";
import {orderBy} from "es-toolkit";
import type {Types} from "~/types/aptos";
import {useAptosClient, useNetworkValue} from "../../global-config";
import {getAccountResource} from "..";
import type {ResponseError} from "../client";

export type ModuleMetadata = {
  name: string;
  source: string;
};

export type UpgradePolicy = {
  // 0 is arbitrary, i.e. publisher can upgrade anyway they want, they need to migrate the data manually
  // 1 is compatible
  // 2 is immutable
  policy: number;
};

export type PackageMetadata = {
  name: string;
  modules: ModuleMetadata[];
  upgrade_policy: UpgradePolicy;
  // The numbers of times this module has been upgraded. Also serves as the on-chain version.
  upgrade_number: string;
  // The source digest of the sources in the package. This is constructed by first building the
  // sha256 of each individual source, than sorting them alphabetically, and sha256 them again.
  source_digest: string;
  // Move.toml file
  manifest: string;
};

export function useGetAccountResource(
  address: string | undefined,
  resource: string,
  ledgerVersion?: number,
): UseQueryResult<Types.MoveResource, ResponseError> {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();

  return useQuery<Types.MoveResource, ResponseError>({
    queryKey: [
      "accountResource",
      {address, resource, ledgerVersion},
      networkValue,
    ],
    queryFn: async () => {
      if (!address) {
        throw new Error("Address is undefined");
      }
      return await getAccountResource(
        {address, resourceType: resource, ledgerVersion},
        aptosClient,
      );
    },
    refetchOnWindowFocus: false,
    enabled: !!address,
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

export function useGetAccountPackages(address: string, ledgerVersion?: number) {
  const {data: registry} = useGetAccountResource(
    address,
    "0x1::code::PackageRegistry",
    ledgerVersion,
  );

  const registryData = registry?.data as {
    packages?: PackageMetadata[];
  };

  const packages: PackageMetadata[] =
    registryData?.packages?.map((pkg): PackageMetadata => {
      const sortedModules = orderBy(pkg.modules, ["name"], ["asc"]);
      return {
        name: pkg.name,
        modules: sortedModules,
        upgrade_policy: pkg.upgrade_policy,
        upgrade_number: pkg.upgrade_number,
        source_digest: pkg.source_digest,
        manifest: pkg.manifest,
      };
    }) || [];

  return orderBy(packages, ["name"], ["asc"]);
}
