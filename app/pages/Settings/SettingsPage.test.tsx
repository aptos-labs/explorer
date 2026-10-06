// @vitest-environment jsdom
// Covers FEAT-SETTINGS-004
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";
import {I18nProvider} from "../../i18n";
import {
  ExplorerSettingsProvider,
  LOCAL_TIMESTAMPS_STORAGE_KEY,
} from "../../settings";
import getDesignTokens from "../../themes/theme";
import SettingsPage from "./SettingsPage";

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    useRouter: () => ({invalidate: async () => undefined}),
  };
});

vi.mock("../layout/PageHeader", () => ({
  default: function PageHeaderStub() {
    return null;
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

function renderSettingsPage() {
  const queryClient = new QueryClient({
    defaultOptions: {queries: {retry: false}},
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <ExplorerSettingsProvider>
          <I18nProvider>
            <SettingsPage />
          </I18nProvider>
        </ExplorerSettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe("FEAT-SETTINGS-004 — timestamp switch", () => {
  it("saves a local-time preference and previews the converted clock", async () => {
    renderSettingsPage();

    const toggle = screen.getByRole("switch", {
      name: "Show timestamps in local time",
    });
    expect((toggle as HTMLInputElement).checked).toBe(false);

    await waitFor(() => {
      expect(screen.getByText(/Your browser time zone is/)).toBeTruthy();
    });
    expect(screen.getByText(/^Example:/)).toBeTruthy();

    fireEvent.click(toggle);
    expect((toggle as HTMLInputElement).checked).toBe(true);
    expect(screen.getByText(/^Example:/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", {name: "Save"}));

    await waitFor(() => {
      expect(window.localStorage.getItem(LOCAL_TIMESTAMPS_STORAGE_KEY)).toBe(
        "true",
      );
    });
  });
});
