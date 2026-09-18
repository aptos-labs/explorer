// @vitest-environment jsdom
// Covers FEAT-GUIDE-001 — guide page layout and table of contents
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {cleanup, render, screen} from "@testing-library/react";
import type {ReactNode} from "react";
import {afterEach, describe, expect, it, vi} from "vitest";
import {I18nProvider} from "../../i18n";
import {ExplorerSettingsProvider} from "../../settings";
import getDesignTokens from "../../themes/theme";
import GuidePage from "./GuidePage";

vi.mock("@tanstack/react-router", () => ({
  useSearch: () => ({}),
  Link: ({children}: {children?: ReactNode}) => children ?? null,
  useNavigate: () => vi.fn(),
}));

vi.mock("../layout/PageHeader", () => ({
  default: function PageHeaderStub() {
    return <div>PageHeader</div>;
  },
}));

vi.mock("../../components/hooks/usePageMetadata", () => ({
  PageMetadata: function PageMetadataStub() {
    return null;
  },
}));

const theme = createTheme(getDesignTokens("light"));

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

function renderGuidePage() {
  return render(
    <ThemeProvider theme={theme}>
      <ExplorerSettingsProvider>
        <I18nProvider>
          <GuidePage />
        </I18nProvider>
      </ExplorerSettingsProvider>
    </ThemeProvider>,
  );
}

describe("FEAT-GUIDE-001 — GuidePage", () => {
  it("renders the title, intro, article sections, and table of contents", () => {
    renderGuidePage();

    expect(
      screen.getByRole("heading", {level: 1, name: "User Guide"}),
    ).toBeTruthy();
    expect(screen.getByText("PageHeader")).toBeTruthy();
    expect(
      screen.getAllByText((_, element) =>
        Boolean(element?.textContent?.includes("This guide explains how to")),
      ).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "What this explorer is",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", {level: 2, name: "Search"}),
    ).toBeTruthy();

    expect(screen.getAllByRole("navigation").length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", {name: "Search"}).length,
    ).toBeGreaterThan(0);
  });
});
