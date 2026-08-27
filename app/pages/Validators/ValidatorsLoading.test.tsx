// @vitest-environment jsdom
import {render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {ValidatorsLoading} from "./ValidatorsLoading";

// Covers FEAT-VALIDATORS-002 — All Nodes table loading indicator
describe("FEAT-VALIDATORS-002 — ValidatorsLoading", () => {
  it("shows a progress spinner and loading copy", () => {
    render(<ValidatorsLoading />);
    expect(
      screen.getByRole("status", {name: "Loading validators"}),
    ).toBeTruthy();
    expect(screen.getByRole("progressbar")).toBeTruthy();
    expect(screen.getByText("Loading validators...")).toBeTruthy();
  });
});
