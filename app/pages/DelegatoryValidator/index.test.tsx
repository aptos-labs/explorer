// @vitest-environment jsdom
// Covers FEAT-VALDEL-001 — `/validator/$address` must render from StakePool
// even when the validators list and indexer pool list are empty.
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {cleanup, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";
import getDesignTokens from "../../themes/theme";

const PRODUCTION_POOL =
  "0x890c86c19974b98594a4e5cd7b0b3a69af1b30afc78853a0c11e882801497320";
const PRODUCTION_OPERATOR =
  "0xb9d1a07cb94e46147b50ba9ce9c0f3b6677d7108384d63fda6e63dfca102bba";

vi.mock("@aptos-labs/wallet-adapter-react", () => ({
  useWallet: () => ({connected: false}),
}));

vi.mock("@tanstack/react-router", () => ({
  useParams: () => ({address: PRODUCTION_POOL}),
}));

vi.mock("../../api/hooks/useGetValidators", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("../../api/hooks/useGetValidators")
  >();
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
    commission: 5,
    validatorStatus: ["2"],
  }),
  useGetDelegationNodeCommissionChange: () => ({nextCommission: 5}),
}));

vi.mock("../../api/hooks/useGetAccountResource", () => ({
  useGetAccountResource: () => ({
    data: {
      type: "0x1::stake::StakePool",
      data: {
        operator_address: PRODUCTION_OPERATOR,
        active: {value: "665339689209144"},
        locked_until_secs: "1788801567",
      },
    },
    error: null,
    isLoading: false,
  }),
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
    return null;
  },
}));

vi.mock("../layout/PageHeader", () => ({
  default: function PageHeaderStub() {
    return <div>PageHeader</div>;
  },
}));

vi.mock("../../components/Banner", () => ({
  Banner: function BannerStub() {
    return null;
  },
}));

import ValidatorPage from "./index";

const theme = createTheme(getDesignTokens("light"));

describe("FEAT-VALDEL-001 — Validator page", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the validator page when lists are empty but StakePool exists", () => {
    render(
      <ThemeProvider theme={theme}>
        <ValidatorPage />
      </ThemeProvider>,
    );

    expect(screen.getByRole("heading", {name: "Validator"})).toBeTruthy();
    expect(screen.getByText("StakingBar")).toBeTruthy();
    expect(screen.getByText("DetailCard")).toBeTruthy();
  });
});
