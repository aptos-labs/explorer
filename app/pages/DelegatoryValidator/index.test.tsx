// @vitest-environment jsdom
// Covers FEAT-VALDEL-001 — `/validator/$address` must render from StakePool
// even when the validators list and indexer pool list are empty.
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {cleanup, render, screen} from "@testing-library/react";
import type {ReactNode} from "react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {ResponseErrorType} from "../../api/client";
import getDesignTokens from "../../themes/theme";

const PRODUCTION_POOL = vi.hoisted(
  () => "0x890c86c19974b98594a4e5cd7b0b3a69af1b30afc78853a0c11e882801497320",
);
const PRODUCTION_OPERATOR = vi.hoisted(
  () => "0xb9d1a07cb94e46147b50ba9ce9c0f3b6677d7108384d63fda6e63dfca102bba",
);

const STAKE_POOL_RESOURCE = vi.hoisted(() => ({
  type: "0x1::stake::StakePool",
  data: {
    operator_address: PRODUCTION_OPERATOR,
    active: {value: "665339689209144"},
    locked_until_secs: "1788801567",
  },
}));

const routeParams = vi.hoisted(() => ({address: PRODUCTION_POOL}));
const walletState = vi.hoisted(() => ({connected: false}));
const resourceState = vi.hoisted(() => ({
  data: STAKE_POOL_RESOURCE as object | undefined,
  error: null as {type: string; message?: string} | null,
  isLoading: false,
}));
const commissionState = vi.hoisted(() => ({
  commission: 5 as number | undefined,
  nextCommission: 5 as number | undefined,
}));

vi.mock("@aptos-labs/wallet-adapter-react", () => ({
  useWallet: () => walletState,
}));

vi.mock("@tanstack/react-router", () => ({
  useParams: () => routeParams,
}));

vi.mock("../../api/hooks/useGetValidators", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../api/hooks/useGetValidators")>();
  return {
    ...actual,
    useGetValidators: () => ({validators: []}),
  };
});

vi.mock("../../api/hooks/delegations", () => ({
  useGetDelegatedStakingPoolList: () => ({
    delegatedStakingPools: [],
    loading: false,
  }),
  useGetDelegationNodeInfo: () => ({
    commission: commissionState.commission,
    validatorStatus: ["2"],
  }),
  useGetDelegationNodeCommissionChange: () => ({
    nextCommission: commissionState.nextCommission,
  }),
}));

vi.mock("../../api/hooks/useGetAccountResource", () => ({
  useGetAccountResource: () => resourceState,
}));

vi.mock("../../api/hooks/useGetValidatorPageSkeletonLoading", () => ({
  useGetValidatorPageSkeletonLoading: () => ({
    setIsMyDepositsSectionSkeletonLoading: vi.fn(),
    setIsStakingBarSkeletonLoading: vi.fn(),
    isSkeletonLoading: false,
  }),
}));

vi.mock("./Title", () => ({
  default: function ValidatorTitleStub() {
    return <h1>Validator</h1>;
  },
}));

vi.mock("./StakingBar", () => ({
  default: function StakingBarStub() {
    return <div>StakingBar</div>;
  },
}));

vi.mock("./DetailCard", () => ({
  default: function DetailCardStub() {
    return <div>DetailCard</div>;
  },
}));

vi.mock("./MyDepositsSection", () => ({
  default: function MyDepositsStub() {
    return <div>MyDeposits</div>;
  },
}));

vi.mock("../layout/PageHeader", () => ({
  default: function PageHeaderStub() {
    return <div>PageHeader</div>;
  },
}));

vi.mock("../../components/Banner", () => ({
  Banner: function BannerStub({children}: {children: ReactNode}) {
    return <div>{children}</div>;
  },
}));

import ValidatorPage from "./index";

const theme = createTheme(getDesignTokens("light"));

function renderPage() {
  return render(
    <ThemeProvider theme={theme}>
      <ValidatorPage />
    </ThemeProvider>,
  );
}

describe("FEAT-VALDEL-001 — Validator page", () => {
  beforeEach(() => {
    routeParams.address = PRODUCTION_POOL;
    walletState.connected = false;
    resourceState.data = STAKE_POOL_RESOURCE;
    resourceState.error = null;
    resourceState.isLoading = false;
    commissionState.commission = 5;
    commissionState.nextCommission = 5;
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the validator page when lists are empty but StakePool exists", () => {
    renderPage();

    expect(screen.getByRole("heading", {name: "Validator"})).toBeTruthy();
    expect(screen.getByText("StakingBar")).toBeTruthy();
    expect(screen.getByText("DetailCard")).toBeTruthy();
  });

  it("renders when getAccountResource returns the SDK-unwrapped StakePool payload", () => {
    // Production useGetAccountResource returns StakePool fields directly
    // (no {type, data} envelope). The page used to treat that as missing
    // and then crash in getLockedUtilSecs on locked_until_secs.
    resourceState.data = STAKE_POOL_RESOURCE.data;
    renderPage();

    expect(screen.getByRole("heading", {name: "Validator"})).toBeTruthy();
    expect(screen.getByText("StakingBar")).toBeTruthy();
    expect(screen.getByText("DetailCard")).toBeTruthy();
    expect(screen.queryByText("Validator Not Found")).toBeNull();
  });

  it("shows an invalid-input error for a malformed address", () => {
    routeParams.address = "not-an-address";
    renderPage();

    expect(screen.getByText("Invalid Input")).toBeTruthy();
    expect(screen.queryByText("StakingBar")).toBeNull();
  });

  it("shows the resource error when the StakePool query fails", () => {
    resourceState.data = undefined;
    resourceState.error = {type: ResponseErrorType.TOO_MANY_REQUESTS};
    renderPage();

    expect(screen.getByText("Too Many Requests")).toBeTruthy();
    expect(screen.queryByText("StakingBar")).toBeNull();
  });

  it("shows skeletons while the StakePool resource is loading", () => {
    resourceState.data = undefined;
    resourceState.isLoading = true;
    renderPage();

    expect(screen.getByText("PageHeader")).toBeTruthy();
    expect(screen.getByRole("heading", {name: "Validator"})).toBeTruthy();
    expect(screen.queryByText("StakingBar")).toBeNull();
    expect(screen.queryByText("DetailCard")).toBeNull();
  });

  it("shows Validator Not Found when the address has no StakePool", () => {
    resourceState.data = undefined;
    resourceState.isLoading = false;
    renderPage();

    expect(screen.getByText("Validator Not Found")).toBeTruthy();
    expect(
      screen.getByText(
        "This address does not have a 0x1::stake::StakePool resource.",
      ),
    ).toBeTruthy();
  });

  it("shows the commission-change banner when the next rate differs", () => {
    commissionState.nextCommission = 8;
    renderPage();

    expect(screen.getByText(/The current commission rate is 5%/)).toBeTruthy();
    expect(screen.getByText(/will be updated to 8%/)).toBeTruthy();
  });

  it("shows My Deposits when a wallet is connected", () => {
    walletState.connected = true;
    renderPage();

    expect(screen.getByText("MyDeposits")).toBeTruthy();
  });
});
