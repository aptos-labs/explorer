import {useCallback, useMemo} from "react";
import {useSearchParams} from "../../routing";

export type FunctionFilterParams = {
  address: string;
  module: string;
  functionName: string;
};

export function isFunctionFilterActive(filter: FunctionFilterParams): boolean {
  return (
    filter.address !== "" || filter.module !== "" || filter.functionName !== ""
  );
}

export default function useFunctionFilter(): {
  functionFilter: FunctionFilterParams;
  handleFunctionFilterChange: (
    field: keyof FunctionFilterParams,
    value: string,
  ) => void;
  clearFunctionFilter: () => void;
  isFilterActive: boolean;
} {
  const [searchParams, setSearchParams] = useSearchParams();

  const functionFilter: FunctionFilterParams = useMemo(() => {
    const addr = searchParams.get("fn_addr") ?? "";
    const mod = searchParams.get("fn_module") ?? "";
    const fn = searchParams.get("fn_name") ?? "";
    if (addr || mod || fn) {
      return {address: addr, module: mod, functionName: fn};
    }

    // Backwards compat: migrate legacy ?fn=0x1::module::function
    const legacy = searchParams.get("fn") ?? "";
    if (legacy) {
      const parts = legacy.split("::");
      return {
        address: parts[0] ?? "",
        module: parts[1] ?? "",
        functionName: parts[2] ?? "",
      };
    }
    return {address: "", module: "", functionName: ""};
  }, [searchParams]);

  const isFilterActive = isFunctionFilterActive(functionFilter);

  const handleFunctionFilterChange = useCallback(
    (field: keyof FunctionFilterParams, value: string) => {
      const paramMap: Record<keyof FunctionFilterParams, string> = {
        address: "fn_addr",
        module: "fn_module",
        functionName: "fn_name",
      };
      const paramKey = paramMap[field];

      if (value) {
        searchParams.set(paramKey, value);
      } else {
        searchParams.delete(paramKey);
        // Cascade: clearing a parent field also clears its dependents.
        if (field === "address") {
          searchParams.delete("fn_module");
          searchParams.delete("fn_name");
        } else if (field === "module") {
          searchParams.delete("fn_name");
        }
      }
      searchParams.delete("page");
      searchParams.delete("start");
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
  );

  const clearFunctionFilter = useCallback(() => {
    searchParams.delete("fn_addr");
    searchParams.delete("fn_module");
    searchParams.delete("fn_name");
    searchParams.delete("page");
    searchParams.delete("start");
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  return {
    functionFilter,
    handleFunctionFilterChange,
    clearFunctionFilter,
    isFilterActive,
  };
}
