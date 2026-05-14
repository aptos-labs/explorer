import {Pagination} from "@mui/material";
import Box from "@mui/material/Box";
import type React from "react";
import {useSearchParams} from "../routing";

/**
 * Read the current page index (1-based) from `?page=` in the URL.
 *
 * Falls back to `1` when the param is missing, empty, NaN, or < 1.
 * Always returns an integer ≥ 1 so callers can use it directly to compute
 * `(page - 1) * limit` offsets.
 */
export function readPageFromSearch(value: string | null): number {
  if (value === null || value === "") return 1;
  const parsed = parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

/**
 * Hook variant for components that already pull from `useSearchParams`.
 */
export function useCurrentPage(): number {
  const [searchParams] = useSearchParams();
  return readPageFromSearch(searchParams.get("page"));
}

type PageNumberPaginationProps = {
  /** 1-based current page (typically derived via {@link useCurrentPage}). */
  currentPage: number;
  /** Total number of pages to render in the pagination control. */
  numPages: number;
  /**
   * Optional analytics callback fired after the URL is updated. Receives the
   * page number the user is navigating to.
   */
  onPageChange?: (newPageNum: number, prevPageNum: number) => void;
  /**
   * When `true`, the component renders a centered `<Box>` wrapper. Useful for
   * call sites that previously inlined this layout. Defaults to `true`.
   */
  centered?: boolean;
};

/**
 * URL-driven page picker that writes the current page index to `?page=`.
 *
 * The URL is the source of truth so users can deep-link or share the current
 * page. Other search params (e.g. `?fn_addr=`, `?fn_module=`, `?fn_name=`,
 * `?network=`, `?type=`) are preserved by `useSearchParams`.
 *
 * Used by:
 *  - global User Transactions table (`/transactions`)
 *  - account All Transactions table (`/account/$address/transactions`)
 *  - account REST fallback transactions table
 */
export default function PageNumberPagination({
  currentPage,
  numPages,
  onPageChange,
  centered = true,
}: PageNumberPaginationProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleChange = (
    _event: React.ChangeEvent<unknown>,
    newPageNum: number,
  ) => {
    if (newPageNum === currentPage) return;
    if (newPageNum <= 1) {
      // Drop the param entirely when on page 1 to keep URLs short and
      // canonical. Page 1 is the default when `?page=` is missing.
      searchParams.delete("page");
    } else {
      searchParams.set("page", newPageNum.toString());
    }
    setSearchParams(searchParams);
    onPageChange?.(newPageNum, currentPage);
  };

  const control = (
    <Pagination
      sx={{mt: 3}}
      count={Math.max(1, numPages)}
      variant="outlined"
      showFirstButton
      showLastButton
      page={currentPage}
      siblingCount={4}
      boundaryCount={0}
      shape="rounded"
      onChange={handleChange}
    />
  );

  if (!centered) return control;

  return <Box sx={{display: "flex", justifyContent: "center"}}>{control}</Box>;
}
