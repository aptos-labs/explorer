// @vitest-environment jsdom
// Covers FEAT-VALDEL-004 — My Deposits must expose its stake actions on mobile
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {cleanup, render, screen} from "@testing-library/react";
import type {ReactNode} from "react";
import {afterEach, describe, expect, it, vi} from "vitest";
import type {Types} from "~/types/aptos";
import type {ValidatorData} from "../../api/hooks/useGetValidators";

const OCTA = 100_000_000;

vi.mock("@aptos-labs/wallet-adapter-react", () => ({
  useWallet: () => ({
    connected: true,
    account: {address: "0x1"},
    wallet: {name: "Test Wallet"},
  }),
}));

vi.mock("../../api", () => ({
  getCanWithdrawPendingInactive: vi.fn().mockResolvedValue([false]),
}));

vi.mock("../../api/hooks/delegations", () => ({
  StakeOperation: {
    STAKE: "add_stake",
    UNLOCK: "unlock",
    REACTIVATE: "reactivate_stake",
    WITHDRAW: "withdraw",
  },
  // active, inactive, pending_inactive
  useGetDelegatorStakeInfo: () => ({
    stakes: [String(120 * OCTA), "0", String(30 * OCTA)],
  }),
  useGetDelegatedStakeOperationActivities: () => ({
    activities: [],
    loading: false,
    error: undefined,
  }),
}));

vi.mock("../../api/hooks/useGetAccountAPTBalance", () => ({
  useGetAccountAPTBalance: () => ({data: String(500 * OCTA)}),
}));

vi.mock("../../global-config/GlobalConfig", () => ({
  useAptosClient: () => ({}),
}));

// GeneralTableRow navigates through the router, which is not mounted here
vi.mock("../../routing", () => ({
  useNavigate: () => vi.fn(),
  useAugmentToWithGlobalSearchParams: () => (to: string) => to,
}));

vi.mock("../Account/hooks/useLogEventWithBasic", () => ({
  useLogEventWithBasic: () => vi.fn(),
}));

vi.mock("./StakeOperationDialog", () => ({
  default: function StakeOperationDialogStub() {
    return null;
  },
}));

vi.mock("./WalletConnectionDialog", () => ({
  default: function WalletConnectionDialogStub() {
    return null;
  },
}));

import getDesignTokens from "../../themes/theme";
import {DelegationStateContext} from "./context/DelegationContext";
import MyDepositsSection from "./MyDepositsSection";

const theme = createTheme(getDesignTokens("light"));

const validator = {
  owner_address: "0x7a2d",
  operator_address: "0x31e5",
  voting_power: "0",
  governance_voting_record: "",
  last_epoch: 0,
  last_epoch_performance: "",
  liveness: 0,
  rewards_growth: 0,
  apt_rewards_distributed: 0,
} as ValidatorData;

const accountResource = {
  type: "0x1::stake::StakePool",
  data: {locked_until_secs: "0"},
} as unknown as Types.MoveResource;

function renderSection(children: ReactNode) {
  return render(
    <ThemeProvider theme={theme}>
      <DelegationStateContext.Provider value={{accountResource, validator}}>
        {children}
      </DelegationStateContext.Provider>
    </ThemeProvider>,
  );
}

describe("FEAT-VALDEL-004 — My Deposits actions", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  // jsdom has no matchMedia, so MUI resolves `breakpoints.up("md")` to false,
  // which is the mobile layout.
  it("renders an action button per deposit on mobile", async () => {
    renderSection(
      <MyDepositsSection
        setIsMyDepositsSectionSkeletonLoading={vi.fn()}
        isSkeletonLoading={false}
      />,
    );

    expect(await screen.findByRole("button", {name: "UNSTAKE"})).toBeTruthy();
    expect(screen.getByRole("button", {name: "RESTAKE"})).toBeTruthy();
    // The mobile layout is card based, not a table
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("renders the deposits table with actions on desktop", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null,
      })),
    );

    renderSection(
      <MyDepositsSection
        setIsMyDepositsSectionSkeletonLoading={vi.fn()}
        isSkeletonLoading={false}
      />,
    );

    expect(await screen.findByRole("table")).toBeTruthy();
    expect(screen.getByRole("button", {name: "UNSTAKE"})).toBeTruthy();
    expect(screen.getByRole("button", {name: "RESTAKE"})).toBeTruthy();
  });
});
