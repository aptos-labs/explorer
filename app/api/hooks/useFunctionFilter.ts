import {useCallback} from "react";
import {useSearchParams} from "../../routing";

export default function useFunctionFilter(): {
  functionFilter: string;
  handleFunctionFilterChange: (value: string) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const functionFilter = searchParams.get("fn") ?? "";

  const handleFunctionFilterChange = useCallback(
    (value: string) => {
      if (value) {
        searchParams.set("fn", value);
      } else {
        searchParams.delete("fn");
      }
      searchParams.delete("page");
      searchParams.delete("start");
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
  );

  return {functionFilter, handleFunctionFilterChange};
}
