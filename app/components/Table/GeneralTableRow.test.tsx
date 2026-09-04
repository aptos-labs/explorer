// @vitest-environment jsdom
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {cleanup, render, screen} from "@testing-library/react";
import type {ReactNode} from "react";
import {afterEach, describe, expect, it, vi} from "vitest";
import GeneralTableRow from "./GeneralTableRow";

vi.mock("../../routing", () => ({
  useNavigate: () => vi.fn(),
  useAugmentToWithGlobalSearchParams: () => (to: string) => to,
}));

afterEach(() => {
  cleanup();
});

const theme = createTheme({
  palette: {
    neutralShade: {main: "#f5f5f5", lighter: "#ffffff", darker: "#eeeeee"},
  },
} as Parameters<typeof createTheme>[0]);

function renderRow(row: ReactNode) {
  return render(
    <ThemeProvider theme={theme}>
      <table>
        <tbody>{row}</tbody>
      </table>
    </ThemeProvider>,
  );
}

/**
 * Emotion injects `sx` styles as class rules, and jsdom's `getComputedStyle`
 * does not resolve `user-select` from them. Read the generated stylesheet text
 * for the row's own classes instead.
 */
function rowRuleText(row: HTMLElement): string {
  const classes = Array.from(row.classList);
  return Array.from(document.querySelectorAll("style"))
    .flatMap((style) => (style.textContent ?? "").split("}"))
    .filter((rule) => classes.some((cls) => rule.includes(`.${cls}`)))
    .join("}");
}

describe("GeneralTableRow — text selection", () => {
  // Covers FEAT-TXN-004: Fee Statement / Decibel / multisig event values render
  // in read-only key/value rows and must stay selectable with the mouse.
  it("keeps read-only rows selectable", () => {
    renderRow(
      <GeneralTableRow>
        <td>1,234 Gas Units</td>
      </GeneralTableRow>,
    );

    const row = screen.getByText("1,234 Gas Units").closest("tr");
    expect(row).not.toBeNull();
    const rules = rowRuleText(row as HTMLElement);
    // Guards against a false pass when no rule text is found at all.
    expect(rules).toContain("text-decoration:none");
    expect(rules).not.toContain("user-select:none");
  });

  it("suppresses selection on rows that navigate", () => {
    renderRow(
      <GeneralTableRow to="/txn/1">
        <td>navigates</td>
      </GeneralTableRow>,
    );

    const row = screen.getByText("navigates").closest("tr");
    expect(row).not.toBeNull();
    expect(rowRuleText(row as HTMLElement)).toContain("user-select:none");
  });

  it("suppresses selection on rows with a click handler", () => {
    renderRow(
      <GeneralTableRow onClick={vi.fn()}>
        <td>clickable</td>
      </GeneralTableRow>,
    );

    const row = screen.getByText("clickable").closest("tr");
    expect(row).not.toBeNull();
    expect(rowRuleText(row as HTMLElement)).toContain("user-select:none");
  });
});
