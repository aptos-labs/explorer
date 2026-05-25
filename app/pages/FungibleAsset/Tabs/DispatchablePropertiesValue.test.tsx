// @vitest-environment jsdom
// Covers FEAT-FA-002 — Dispatchable chip + per-hook source links rendering
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {cleanup, render} from "@testing-library/react";
import type {ReactNode} from "react";
import {afterEach, describe, expect, it, vi} from "vitest";

vi.mock("../../../routing", () => ({
  Link: function LinkStub({to, children}: {to: string; children: ReactNode}) {
    return (
      <a data-testid="dispatch-link" href={to}>
        {children}
      </a>
    );
  },
}));

import type {FaDispatchInfo} from "../../../api/hooks/useGetFaIsDispatchable";
import DispatchablePropertiesValue from "./DispatchablePropertiesValue";

const theme = createTheme();

function withTheme(ui: ReactNode) {
  return <ThemeProvider theme={theme}>{ui}</ThemeProvider>;
}

describe("DispatchablePropertiesValue", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders only the Dispatchable chip when no functions are registered", () => {
    const info: FaDispatchInfo = {isDispatchable: true, functions: []};
    const {container, queryAllByTestId} = render(
      withTheme(<DispatchablePropertiesValue info={info} />),
    );
    expect(container.textContent).toContain("Dispatchable");
    expect(queryAllByTestId("dispatch-link")).toHaveLength(0);
  });

  it("renders one labeled link per registered hook pointing at the module code page", () => {
    const info: FaDispatchInfo = {
      isDispatchable: true,
      functions: [
        {
          hook: "withdraw",
          moduleAddress: "0xabc",
          moduleName: "issuer",
          functionName: "withdraw_hook",
        },
        {
          hook: "deposit",
          moduleAddress: "0xabc",
          moduleName: "issuer",
          functionName: "deposit_hook",
        },
        {
          hook: "derived_balance",
          moduleAddress: "0xdef",
          moduleName: "balance",
          functionName: "compute",
        },
        {
          hook: "derived_supply",
          moduleAddress: "0xfeed",
          moduleName: "issuer",
          functionName: "supply_hook",
        },
      ],
    };
    const {container, getAllByTestId} = render(
      withTheme(<DispatchablePropertiesValue info={info} />),
    );
    const text = container.textContent ?? "";
    expect(text).toContain("Dispatchable");
    expect(text).toContain("Withdraw:");
    expect(text).toContain("Deposit:");
    expect(text).toContain("Derived balance:");
    expect(text).toContain("Derived supply:");

    const links = getAllByTestId("dispatch-link");
    expect(links).toHaveLength(4);
    expect(links[0]?.getAttribute("href")).toBe(
      "/account/0xabc/modules/code/issuer",
    );
    expect(links[1]?.getAttribute("href")).toBe(
      "/account/0xabc/modules/code/issuer",
    );
    expect(links[2]?.getAttribute("href")).toBe(
      "/account/0xdef/modules/code/balance",
    );
    expect(links[3]?.getAttribute("href")).toBe(
      "/account/0xfeed/modules/code/issuer",
    );
  });
});
