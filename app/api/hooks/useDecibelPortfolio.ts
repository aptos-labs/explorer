import {useQueries, useQuery} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import {useAptosClient, useNetworkName} from "../../global-config";
import {getDecibelContractForNetwork} from "../../utils/decibel";
import {view} from "../index";

/**
 * On-chain reads for the account Portfolio tab's Decibel section. We pin to a
 * single contract per network (instead of trying every known contract) so
 * unrelated networks never issue Decibel view calls.
 */

function extractObjectInner(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "inner" in value) {
    const inner = (value as {inner: unknown}).inner;
    return typeof inner === "string" ? inner : undefined;
  }
  return undefined;
}

function isViewCallNotApplicable(error: unknown): boolean {
  // Decibel view functions abort with `ENOT_FOUND`-style errors when the user
  // has no subaccount / no position. Treat any aborted view call as "no data"
  // so we don't surface a scary error to users who simply have never used
  // Decibel.
  if (typeof error !== "object" || error === null) return false;
  const message =
    "message" in error &&
    typeof (error as {message: unknown}).message === "string"
      ? (error as {message: string}).message
      : "";
  return (
    message.includes("MOVE_ABORT") ||
    message.includes("VMError") ||
    message.includes("FUNCTION_RESOLUTION_FAILURE") ||
    message.includes("missing data") ||
    message.includes("not found")
  );
}

function toBigintString(value: unknown): string | undefined {
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  return undefined;
}

export type DecibelPosition = {
  market: string;
  size: string | undefined;
  isLong: boolean | undefined;
  isolated: boolean | undefined;
};

export type DecibelPortfolio = {
  contract: string;
  subaccount: string | undefined;
  netAssetValue: string | undefined;
  crossCollateral: string | undefined;
  positions: DecibelPosition[];
};

export type DecibelPortfolioState = {
  data: DecibelPortfolio | undefined;
  isLoading: boolean;
  isSupportedNetwork: boolean;
};

export function useDecibelPortfolio(
  ownerAddress: string,
): DecibelPortfolioState {
  const networkName = useNetworkName();
  const aptosClient = useAptosClient();
  const contract = getDecibelContractForNetwork(networkName);
  const lookupEnabled = Boolean(contract) && Boolean(ownerAddress);

  const subaccountQuery = useQuery<string | null, Error>({
    queryKey: [
      "decibelPrimarySubaccount",
      networkName,
      contract ?? null,
      ownerAddress,
    ],
    queryFn: async (): Promise<string | null> => {
      if (!contract) return null;
      const request: Types.ViewRequest = {
        function: `${contract}::dex_accounts::primary_subaccount`,
        type_arguments: [],
        arguments: [ownerAddress],
      };
      try {
        const response = await view(request, aptosClient);
        const inner = extractObjectInner(response?.[0]);
        return inner ?? null;
      } catch (error) {
        if (isViewCallNotApplicable(error)) return null;
        throw error;
      }
    },
    enabled: lookupEnabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const subaccount = subaccountQuery.data ?? undefined;
  const summaryEnabled = Boolean(contract && subaccount);

  const summaryQueries = useQueries({
    queries: [
      {
        queryKey: [
          "decibelNetAssetValue",
          networkName,
          contract ?? null,
          subaccount ?? null,
        ],
        queryFn: async (): Promise<string | undefined> => {
          if (!contract || !subaccount) return undefined;
          try {
            const result = await view(
              {
                function: `${contract}::perp_engine::get_account_net_asset_value`,
                type_arguments: [],
                arguments: [subaccount],
              },
              aptosClient,
            );
            return toBigintString(result?.[0]);
          } catch (error) {
            if (isViewCallNotApplicable(error)) return undefined;
            throw error;
          }
        },
        enabled: summaryEnabled,
        staleTime: 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      {
        queryKey: [
          "decibelCrossCollateral",
          networkName,
          contract ?? null,
          subaccount ?? null,
        ],
        queryFn: async (): Promise<string | undefined> => {
          if (!contract || !subaccount) return undefined;
          try {
            const result = await view(
              {
                function: `${contract}::perp_engine::get_cross_total_collateral_value`,
                type_arguments: [],
                arguments: [subaccount],
              },
              aptosClient,
            );
            return toBigintString(result?.[0]);
          } catch (error) {
            if (isViewCallNotApplicable(error)) return undefined;
            throw error;
          }
        },
        enabled: summaryEnabled,
        staleTime: 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      {
        queryKey: [
          "decibelListPositions",
          networkName,
          contract ?? null,
          subaccount ?? null,
        ],
        queryFn: async (): Promise<string[]> => {
          if (!contract || !subaccount) return [];
          try {
            const result = await view(
              {
                function: `${contract}::perp_engine::list_positions`,
                type_arguments: [],
                arguments: [subaccount],
              },
              aptosClient,
            );
            const v = result?.[0];
            if (!Array.isArray(v)) return [];
            return v
              .map((entry) => extractObjectInner(entry))
              .filter((entry): entry is string => Boolean(entry));
          } catch (error) {
            if (isViewCallNotApplicable(error)) return [];
            throw error;
          }
        },
        enabled: summaryEnabled,
        staleTime: 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    ],
  });

  const [navQuery, crossQuery, positionsQuery] = summaryQueries;
  const marketAddresses: string[] =
    (positionsQuery?.data as string[] | undefined) ?? [];

  const positionDetails = useQueries({
    queries: marketAddresses.map((market) => ({
      queryKey: [
        "decibelViewPosition",
        networkName,
        contract ?? null,
        subaccount ?? null,
        market,
      ],
      queryFn: async (): Promise<DecibelPosition> => {
        if (!contract || !subaccount) {
          return {
            market,
            size: undefined,
            isLong: undefined,
            isolated: undefined,
          };
        }
        const [sizeRes, isLongRes, isolatedRes] = await Promise.allSettled([
          view(
            {
              function: `${contract}::perp_engine::get_position_size`,
              type_arguments: [],
              arguments: [subaccount, market],
            },
            aptosClient,
          ),
          view(
            {
              function: `${contract}::perp_engine::get_position_is_long`,
              type_arguments: [],
              arguments: [subaccount, market],
            },
            aptosClient,
          ),
          view(
            {
              function: `${contract}::perp_engine::is_position_isolated`,
              type_arguments: [],
              arguments: [subaccount, market],
            },
            aptosClient,
          ),
        ]);
        const size =
          sizeRes.status === "fulfilled"
            ? toBigintString(sizeRes.value?.[0])
            : undefined;
        const isLong =
          isLongRes.status === "fulfilled" &&
          typeof isLongRes.value?.[0] === "boolean"
            ? (isLongRes.value[0] as boolean)
            : undefined;
        const isolated =
          isolatedRes.status === "fulfilled" &&
          typeof isolatedRes.value?.[0] === "boolean"
            ? (isolatedRes.value[0] as boolean)
            : undefined;
        return {market, size, isLong, isolated};
      },
      enabled: Boolean(contract && subaccount && market),
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    })),
  });

  const isLoading =
    subaccountQuery.isLoading ||
    (summaryEnabled &&
      (navQuery?.isLoading === true ||
        crossQuery?.isLoading === true ||
        positionsQuery?.isLoading === true ||
        positionDetails.some((q) => q.isLoading)));

  const data: DecibelPortfolio | undefined = contract
    ? {
        contract,
        subaccount,
        netAssetValue: navQuery?.data as string | undefined,
        crossCollateral: crossQuery?.data as string | undefined,
        positions: positionDetails
          .map((q) => q.data)
          .filter((p): p is DecibelPosition => Boolean(p)),
      }
    : undefined;

  return {
    data,
    isLoading,
    isSupportedNetwork: Boolean(contract),
  };
}
