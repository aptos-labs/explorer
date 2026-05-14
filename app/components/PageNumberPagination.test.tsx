// @vitest-environment jsdom
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import type {ReactNode} from "react";
import {afterEach, describe, expect, it, vi} from "vitest";

// Stub the routing module so we can drive `useSearchParams` from a controlled
// store and assert what gets written back to the URL.
type SearchStore = {
  current: Record<string, string>;
  writes: Array<Record<string, string>>;
};

const store: SearchStore = {current: {}, writes: []};

function resetStore(initial: Record<string, string> = {}) {
  store.current = {...initial};
  store.writes = [];
}

vi.mock("../routing", () => {
  return {
    useSearchParams() {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(store.current)) {
        params.set(k, v);
      }
      const setSearchParams = (
        next: URLSearchParams | Record<string, string | undefined>,
      ) => {
        const obj: Record<string, string> = {};
        if (next instanceof URLSearchParams) {
          for (const [k, v] of next.entries()) {
            obj[k] = v;
          }
        } else {
          for (const [k, v] of Object.entries(next)) {
            if (v !== undefined && v !== "") obj[k] = v;
          }
        }
        store.current = obj;
        store.writes.push({...obj});
      };
      return [params, setSearchParams] as const;
    },
  };
});

import PageNumberPagination, {
  readPageFromSearch,
  useCurrentPage,
} from "./PageNumberPagination";
import {renderHook} from "@testing-library/react";

const theme = createTheme();

function withTheme(ui: ReactNode) {
  return <ThemeProvider theme={theme}>{ui}</ThemeProvider>;
}

describe("readPageFromSearch", () => {
  it("defaults to 1 when missing or invalid", () => {
    expect(readPageFromSearch(null)).toBe(1);
    expect(readPageFromSearch("")).toBe(1);
    expect(readPageFromSearch("abc")).toBe(1);
    expect(readPageFromSearch("0")).toBe(1);
    expect(readPageFromSearch("-3")).toBe(1);
    expect(readPageFromSearch("NaN")).toBe(1);
  });

  it("returns parsed page for valid integers", () => {
    expect(readPageFromSearch("1")).toBe(1);
    expect(readPageFromSearch("2")).toBe(2);
    expect(readPageFromSearch("17")).toBe(17);
    expect(readPageFromSearch("1000")).toBe(1000);
  });
});

describe("useCurrentPage", () => {
  afterEach(() => {
    cleanup();
    resetStore();
  });

  it("reads ?page= from URL", () => {
    resetStore({page: "5"});
    const {result} = renderHook(() => useCurrentPage());
    expect(result.current).toBe(5);
  });

  it("defaults to 1 when ?page= is missing", () => {
    resetStore({});
    const {result} = renderHook(() => useCurrentPage());
    expect(result.current).toBe(1);
  });

  it("defaults to 1 when ?page= is invalid", () => {
    resetStore({page: "not-a-number"});
    const {result} = renderHook(() => useCurrentPage());
    expect(result.current).toBe(1);
  });
});

describe("PageNumberPagination", () => {
  afterEach(() => {
    cleanup();
    resetStore();
  });

  function clickPage(label: string) {
    const button = screen.getByRole("button", {name: new RegExp(label, "i")});
    fireEvent.click(button);
  }

  it("writes ?page= to the URL when paginating forward", () => {
    // Covers FEAT-ACCOUNT-006 / FEAT-TXN-001 — pagination must be in the
    // query string so users can deep-link the current page.
    resetStore({});
    render(withTheme(<PageNumberPagination currentPage={1} numPages={10} />));
    clickPage("Go to page 2");

    expect(store.writes).toHaveLength(1);
    expect(store.writes[0].page).toBe("2");
  });

  it("preserves other search params when changing pages", () => {
    resetStore({
      type: "user",
      fn_addr: "0x1",
      fn_module: "coin",
      fn_name: "transfer",
      network: "mainnet",
    });
    render(withTheme(<PageNumberPagination currentPage={2} numPages={10} />));
    clickPage("Go to page 3");

    const written = store.writes[0];
    expect(written.page).toBe("3");
    // Filter and other globally-tracked params must round-trip.
    expect(written.type).toBe("user");
    expect(written.fn_addr).toBe("0x1");
    expect(written.fn_module).toBe("coin");
    expect(written.fn_name).toBe("transfer");
    expect(written.network).toBe("mainnet");
  });

  it("drops ?page= when navigating to page 1 (canonical URL)", () => {
    resetStore({page: "5", fn_addr: "0x1"});
    render(withTheme(<PageNumberPagination currentPage={5} numPages={10} />));
    clickPage("Go to first page");

    const written = store.writes[0];
    expect(written.page).toBeUndefined();
    expect(written.fn_addr).toBe("0x1");
  });

  it("does not navigate when clicking the current page", () => {
    resetStore({page: "3"});
    render(withTheme(<PageNumberPagination currentPage={3} numPages={10} />));
    clickPage("page 3");

    expect(store.writes).toHaveLength(0);
  });

  it("invokes onPageChange callback with new and previous page numbers", () => {
    resetStore({});
    const onPageChange = vi.fn();
    render(
      withTheme(
        <PageNumberPagination
          currentPage={1}
          numPages={10}
          onPageChange={onPageChange}
        />,
      ),
    );
    clickPage("Go to page 4");

    expect(onPageChange).toHaveBeenCalledTimes(1);
    expect(onPageChange).toHaveBeenCalledWith(4, 1);
  });

  it("renders at least 1 page even when numPages is 0", () => {
    resetStore({});
    render(withTheme(<PageNumberPagination currentPage={1} numPages={0} />));
    // The MUI Pagination with `count={1}` exposes "page 1" as the active
    // (current) page; assert the control rendered without crashing.
    expect(screen.getByRole("navigation")).toBeTruthy();
  });
});
