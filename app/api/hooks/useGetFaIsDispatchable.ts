import {useMemo} from "react";
import type {Types} from "~/types/aptos";
import {useGetAccountResources} from "./useGetAccountResources";

/**
 * One of the four dispatch hooks an issuer can register against a fungible
 * asset metadata object. The first three live in
 * `0x1::fungible_asset::DispatchFunctionStore`; the fourth in the separate
 * `0x1::fungible_asset::DeriveSupply` resource.
 */
export type DispatchHook =
  | "withdraw"
  | "deposit"
  | "derived_balance"
  | "derived_supply";

export type DispatchFunctionInfo = {
  hook: DispatchHook;
  moduleAddress: string;
  moduleName: string;
  functionName: string;
};

export type FaDispatchInfo = {
  /** True when the FA metadata object owns a `DispatchFunctionStore`. */
  isDispatchable: boolean;
  /** Parsed function identifiers per registered hook (Option::some entries only). */
  functions: DispatchFunctionInfo[];
};

type OptionVec<T = unknown> = {vec: T[]};

type RawFunctionInfo = {
  module_address?: unknown;
  module_name?: unknown;
  function_name?: unknown;
};

function readString(value: unknown): string | null {
  if (typeof value === "string") return value;
  return null;
}

function parseFunctionInfo(
  hook: DispatchHook,
  opt: OptionVec<RawFunctionInfo> | undefined,
): DispatchFunctionInfo | null {
  if (!opt || !Array.isArray(opt.vec) || opt.vec.length === 0) return null;
  const raw = opt.vec[0];
  const moduleAddress = readString(raw?.module_address);
  const moduleName = readString(raw?.module_name);
  const functionName = readString(raw?.function_name);
  if (!moduleAddress || !moduleName || !functionName) return null;
  return {hook, moduleAddress, moduleName, functionName};
}

export function deriveDispatchInfo(
  resources: Types.MoveResource[] | undefined,
): FaDispatchInfo | null {
  if (!resources) return null;

  const store = resources.find(
    (r) => r.type === "0x1::fungible_asset::DispatchFunctionStore",
  );
  if (!store) return null;

  const storeData = store.data as {
    withdraw_function?: OptionVec<RawFunctionInfo>;
    deposit_function?: OptionVec<RawFunctionInfo>;
    derived_balance_function?: OptionVec<RawFunctionInfo>;
  };

  const functions: DispatchFunctionInfo[] = [];
  const withdraw = parseFunctionInfo("withdraw", storeData.withdraw_function);
  if (withdraw) functions.push(withdraw);
  const deposit = parseFunctionInfo("deposit", storeData.deposit_function);
  if (deposit) functions.push(deposit);
  const derivedBalance = parseFunctionInfo(
    "derived_balance",
    storeData.derived_balance_function,
  );
  if (derivedBalance) functions.push(derivedBalance);

  // `derived_supply` lives in a separate resource per framework definition.
  const deriveSupply = resources.find(
    (r) => r.type === "0x1::fungible_asset::DeriveSupply",
  );
  if (deriveSupply) {
    const supplyData = deriveSupply.data as {
      dispatch_function?: OptionVec<RawFunctionInfo>;
    };
    const derivedSupply = parseFunctionInfo(
      "derived_supply",
      supplyData.dispatch_function,
    );
    if (derivedSupply) functions.push(derivedSupply);
  }

  return {isDispatchable: true, functions};
}

export function useGetFaIsDispatchable(address: string | undefined): {
  isLoading: boolean;
  data: FaDispatchInfo | null;
} {
  const {data: resources, isLoading} = useGetAccountResources(address ?? "", {
    retry: false,
    enabled: !!address,
  });

  const dispatchInfo = useMemo(
    () => deriveDispatchInfo(resources),
    [resources],
  );

  return {isLoading, data: dispatchInfo};
}
