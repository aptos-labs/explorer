import {useCallback} from "react";
import {useSearchParams} from "../../routing";

export default function useAssetFilter(): {
  assetFilter: string;
  handleAssetFilterChange: (value: string) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const assetFilter = searchParams.get("asset") ?? "";

  const handleAssetFilterChange = useCallback(
    (value: string) => {
      if (value) {
        searchParams.set("asset", value);
      } else {
        searchParams.delete("asset");
      }
      searchParams.delete("page");
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
  );

  return {assetFilter, handleAssetFilterChange};
}
