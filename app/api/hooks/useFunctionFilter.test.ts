// @vitest-environment jsdom
import {act, renderHook} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";

// Stub `routing` so we can drive `useSearchParams` from a controlled store
// and assert what gets written back to the URL when the filter changes.
type SearchStore = {
  current: Record<string, string>;
  writes: Array<Record<string, string>>;
};

const store: SearchStore = {current: {}, writes: []};

function resetStore(initial: Record<string, string> = {}) {
  store.current = {...initial};
  store.writes = [];
}

vi.mock("../../routing", () => {
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

import useFunctionFilter, {isFunctionFilterActive} from "./useFunctionFilter";

describe("isFunctionFilterActive", () => {
  it("is inactive when all fields are empty", () => {
    expect(
      isFunctionFilterActive({address: "", module: "", functionName: ""}),
    ).toBe(false);
  });

  it("is active when any field is set", () => {
    expect(
      isFunctionFilterActive({address: "0x1", module: "", functionName: ""}),
    ).toBe(true);
    expect(
      isFunctionFilterActive({
        address: "",
        module: "coin",
        functionName: "",
      }),
    ).toBe(true);
    expect(
      isFunctionFilterActive({
        address: "",
        module: "",
        functionName: "transfer",
      }),
    ).toBe(true);
  });
});

describe("useFunctionFilter", () => {
  afterEach(() => {
    resetStore();
  });

  it("reads filter values from search params", () => {
    resetStore({fn_addr: "0x1", fn_module: "coin", fn_name: "transfer"});
    const {result} = renderHook(() => useFunctionFilter());
    expect(result.current.functionFilter).toEqual({
      address: "0x1",
      module: "coin",
      functionName: "transfer",
    });
    expect(result.current.isFilterActive).toBe(true);
  });

  it("migrates legacy ?fn= shorthand to the canonical fields", () => {
    resetStore({fn: "0x1::coin::transfer"});
    const {result} = renderHook(() => useFunctionFilter());
    expect(result.current.functionFilter).toEqual({
      address: "0x1",
      module: "coin",
      functionName: "transfer",
    });
  });

  it("resets ?page= when the filter changes", () => {
    // Covers FEAT-ACCOUNT-006 / FEAT-TXN-001 — changing the filter must
    // restart pagination at page 1 so users land on a valid result set.
    resetStore({fn_addr: "0x1", page: "5", network: "mainnet"});
    const {result} = renderHook(() => useFunctionFilter());

    act(() => {
      result.current.handleFunctionFilterChange("module", "coin");
    });

    expect(store.writes).toHaveLength(1);
    const written = store.writes[0];
    expect(written.fn_module).toBe("coin");
    expect(written.fn_addr).toBe("0x1");
    expect(written.network).toBe("mainnet");
    // page must be cleared when filter changes
    expect(written.page).toBeUndefined();
  });

  it("resets ?start= when the filter changes (All Transactions URL state)", () => {
    resetStore({start: "12345", fn_addr: "0x1"});
    const {result} = renderHook(() => useFunctionFilter());

    act(() => {
      result.current.handleFunctionFilterChange("module", "coin");
    });

    const written = store.writes[0];
    expect(written.start).toBeUndefined();
  });

  it("cascades clear: clearing address also clears module + function name", () => {
    resetStore({
      fn_addr: "0x1",
      fn_module: "coin",
      fn_name: "transfer",
      page: "3",
    });
    const {result} = renderHook(() => useFunctionFilter());

    act(() => {
      result.current.handleFunctionFilterChange("address", "");
    });

    const written = store.writes[0];
    expect(written.fn_addr).toBeUndefined();
    expect(written.fn_module).toBeUndefined();
    expect(written.fn_name).toBeUndefined();
    expect(written.page).toBeUndefined();
  });

  it("cascades clear: clearing module also clears function name (keeps address)", () => {
    resetStore({fn_addr: "0x1", fn_module: "coin", fn_name: "transfer"});
    const {result} = renderHook(() => useFunctionFilter());

    act(() => {
      result.current.handleFunctionFilterChange("module", "");
    });

    const written = store.writes[0];
    expect(written.fn_addr).toBe("0x1");
    expect(written.fn_module).toBeUndefined();
    expect(written.fn_name).toBeUndefined();
  });

  it("clearFunctionFilter wipes all filter params and resets page/start", () => {
    resetStore({
      fn_addr: "0x1",
      fn_module: "coin",
      fn_name: "transfer",
      page: "7",
      start: "9999",
      network: "testnet",
    });
    const {result} = renderHook(() => useFunctionFilter());

    act(() => {
      result.current.clearFunctionFilter();
    });

    const written = store.writes[0];
    expect(written.fn_addr).toBeUndefined();
    expect(written.fn_module).toBeUndefined();
    expect(written.fn_name).toBeUndefined();
    expect(written.page).toBeUndefined();
    expect(written.start).toBeUndefined();
    // Unrelated params survive.
    expect(written.network).toBe("testnet");
  });
});
