/** @vitest-environment jsdom */
// Covers FEAT-VALIDATORS-003 — desktop delegation table skeleton while the list loads
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {cleanup, render, screen} from "@testing-library/react";
import type {ReactNode} from "react";
import {afterEach, describe, expect, it, vi} from "vitest";
import {I18nProvider} from "../../../i18n";
import {ExplorerSettingsProvider} from "../../../settings";
import getDesignTokens from "../../../themes/theme";

vi.mock("../../../routing", () => ({
  useNavigate: () => vi.fn(),
  useAugmentToWithGlobalSearchParams: () => (to: string) => to,
}));

vi.mock("../../../context/wallet-adapter", () => ({
  useWallet: () => ({connected: false, account: null}),
}));

vi.mock("../../../api/hooks/useGetValidatorSet", () => ({
  useGetValidatorSet: () => ({totalVotingPower: 0}),
}));

vi.mock("./hooks/useValidatorDelegationData", () => ({
  useValidatorDelegationData: () => ({
    validators: undefined,
    isLoading: true,
    error: undefined,
  }),
}));

import {EnhancedDelegationValidatorsTable} from "./EnhancedDelegationValidatorsTable";

const theme = createTheme(getDesignTokens("light"));

// Disconnected desktop columns: addr, status, operator, amount, commission,
// delegators, rewards. Ten skeleton rows.
const SKELETON_ROWS = 10;
const DISCONNECTED_COLUMNS = 7;

function LoadingWrapper({children}: {children: ReactNode}) {
  return (
    <ExplorerSettingsProvider>
      <I18nProvider>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </I18nProvider>
    </ExplorerSettingsProvider>
  );
}

describe("FEAT-VALIDATORS-003 — delegation table loading skeleton", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a skeleton cell per column on desktop while validators load", () => {
    // jsdom has no matchMedia, so useMediaQuery(down("md")) is false (desktop).
    render(<EnhancedDelegationValidatorsTable />, {wrapper: LoadingWrapper});

    const table = screen.getByRole("table", {name: "Delegation validators"});
    const widths = [
      ...table.querySelectorAll<HTMLElement>(".MuiSkeleton-root"),
    ].map((node) => node.style.width);

    expect(widths).toHaveLength(SKELETON_ROWS * DISCONNECTED_COLUMNS);
    expect(widths.filter((width) => width === "200px")).toHaveLength(
      SKELETON_ROWS,
    );
    expect(widths.filter((width) => width === "80px")).toHaveLength(
      SKELETON_ROWS,
    );
    expect(widths.filter((width) => width === "100px")).toHaveLength(
      SKELETON_ROWS * (DISCONNECTED_COLUMNS - 2),
    );
    expect(screen.getByText("Loading validators...")).toBeTruthy();
  });
});
