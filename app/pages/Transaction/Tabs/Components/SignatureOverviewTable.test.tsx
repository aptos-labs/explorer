// @vitest-environment jsdom
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {render} from "@testing-library/react";
import type {ReactNode} from "react";
import {describe, expect, it} from "vitest";
import SignatureOverviewTable from "./SignatureOverviewTable";

const theme = createTheme();

function withTheme(ui: ReactNode) {
  return <ThemeProvider theme={theme}>{ui}</ThemeProvider>;
}

describe("SignatureOverviewTable — FEAT-TXN-002", () => {
  it("renders Ed25519 signature as labeled rows (fee-statement-style table)", () => {
    const signature = {
      type: "ed25519_signature",
      public_key:
        "0x8d2a6dc60eaeacf89cba9e53db787d77165c63be218175c24009252eaf57c513",
      signature:
        "0x19ad346523d83bd0626aaf8e6910c4ec1f54f124eb6fefc2fdd004619e54a281ca4ae756675d331458bd968a1cf7a42263fc6fe1aebe0cd91d041bd291355503",
    };

    const {container} = render(
      withTheme(<SignatureOverviewTable signature={signature} />),
    );

    const text = container.textContent ?? "";
    expect(container.querySelector("table")).toBeTruthy();
    expect(text).toContain("Scheme");
    expect(text).toContain("Public key");
    expect(text).toContain("Signature");
    expect(text).toContain("Ed25519");
  });

  it("shows empty state when signature is missing", () => {
    const {container} = render(
      withTheme(<SignatureOverviewTable signature={undefined} />),
    );
    expect(container.textContent).toContain("N/A");
  });
});
