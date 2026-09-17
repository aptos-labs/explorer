// @vitest-environment jsdom
import {cleanup, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";
import {I18nProvider} from "../../../i18n";
import {RewardsEarnedValue} from "./RewardsEarnedValue";

vi.mock("../../../settings/ExplorerSettings", () => ({
  useExplorerSettings: () => ({settings: {localePreference: "de"}}),
}));

afterEach(cleanup);

// Covers FEAT-VALIDATORS-003 — rewards shared by desktop rows and mobile cards.
describe("RewardsEarnedValue", () => {
  it.each([
    [166921.01, "166,921.01 APT"],
    [0, "0.00 APT"],
    [12, "12.00 APT"],
    [12.3456, "12.35 APT"],
  ])("renders %s APT without integer conversion", (amount, expected) => {
    render(<RewardsEarnedValue amount={amount} />);
    expect(screen.getByText(expected)).toBeTruthy();
  });

  it("uses the selected locale for grouping and decimal separators", () => {
    render(
      <I18nProvider>
        <RewardsEarnedValue amount={166921.01} />
      </I18nProvider>,
    );
    expect(screen.getByText("166.921,01 APT")).toBeTruthy();
  });
});
