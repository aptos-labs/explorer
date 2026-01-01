import {useState, useMemo, useCallback} from "react";

/**
 * Configuration for a filterable column.
 * Maps column keys to functions that extract the filterable string value from a data item.
 */
export type FilterConfig<TData, TColumn extends string> = {
  [K in TColumn]?: (item: TData) => string | null | undefined;
};

/**
 * Filter state - maps column keys to filter values.
 */
export type FilterState<TColumn extends string> = {
  [K in TColumn]?: string;
};

interface UseTableFiltersResult<TData, TColumn extends string> {
  /** Current filter values per column */
  filters: FilterState<TColumn>;
  /** Set filter value for a specific column */
  setFilter: (column: TColumn, value: string) => void;
  /** Clear all filters */
  clearFilters: () => void;
  /** Filter the data based on current filter state */
  filterData: (data: TData[]) => TData[];
  /** Check if any filters are active */
  hasActiveFilters: boolean;
}

/**
 * Hook to manage table column filters.
 *
 * @param filterConfig - Configuration mapping columns to value extractors
 * @returns Filter state and utilities
 *
 * @example
 * ```tsx
 * const filterConfig = {
 *   name: (item) => item.name,
 *   status: (item) => item.status,
 *   address: (item) => item.address,
 * };
 *
 * const {filters, setFilter, filterData} = useTableFilters(filterConfig);
 *
 * const filteredData = filterData(data);
 * ```
 */
export function useTableFilters<TData, TColumn extends string>(
  filterConfig: FilterConfig<TData, TColumn>,
): UseTableFiltersResult<TData, TColumn> {
  const [filters, setFilters] = useState<FilterState<TColumn>>(
    {} as FilterState<TColumn>,
  );

  const setFilter = useCallback((column: TColumn, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({} as FilterState<TColumn>);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) => typeof value === "string" && value.length > 0,
    );
  }, [filters]);

  const filterData = useCallback(
    (data: TData[]): TData[] => {
      if (!hasActiveFilters) {
        return data;
      }

      return data.filter((item) => {
        // Check each active filter
        for (const [column, filterValue] of Object.entries(filters)) {
          const filterStr = filterValue as string | undefined;
          if (!filterStr || filterStr.length === 0) {
            continue;
          }

          const extractor = filterConfig[column as TColumn];
          if (!extractor) {
            continue;
          }

          const itemValue = extractor(item);
          if (itemValue === null || itemValue === undefined) {
            return false;
          }

          // Case-insensitive contains match
          const normalizedFilter = filterStr.toLowerCase();
          const normalizedValue = itemValue.toLowerCase();

          if (!normalizedValue.includes(normalizedFilter)) {
            return false;
          }
        }

        return true;
      });
    },
    [filters, filterConfig, hasActiveFilters],
  );

  return {
    filters,
    setFilter,
    clearFilters,
    filterData,
    hasActiveFilters,
  };
}
