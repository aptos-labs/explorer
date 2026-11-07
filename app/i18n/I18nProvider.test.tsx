// @vitest-environment jsdom
// Covers FEAT-I18N-001 — lazy catalog loading in I18nProvider
import {act, cleanup, render, screen, waitFor} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {ExplorerSettingsProvider} from "../settings";
import {I18nProvider, useTranslation} from "./I18nProvider";
import type {SupportedLocale} from "./locales";
import {en} from "./messages/en";
import {fr} from "./messages/fr";
import type {MessageTree} from "./translate";

const {loadMessageCatalog} = vi.hoisted(() => ({
  loadMessageCatalog:
    vi.fn<(locale: SupportedLocale) => Promise<MessageTree>>(),
}));

vi.mock("./messages/loaders", () => ({loadMessageCatalog}));

function Probe() {
  const {locale, t} = useTranslation();
  return (
    <>
      <span data-testid="locale">{locale}</span>
      <span data-testid="blocks">{t("chrome.nav.blocks")}</span>
    </>
  );
}

function renderProbe() {
  return render(
    <ExplorerSettingsProvider>
      <I18nProvider>
        <Probe />
      </I18nProvider>
    </ExplorerSettingsProvider>,
  );
}

function stubBrowserLanguages(languages: string[]) {
  vi.stubGlobal("navigator", {
    ...navigator,
    language: languages[0],
    languages,
  });
}

beforeEach(() => {
  loadMessageCatalog.mockReset();
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  vi.unstubAllGlobals();
});

describe("FEAT-I18N-001 — I18nProvider catalog loading", () => {
  it("ignores a catalog that resolves after the requested locale changed", async () => {
    stubBrowserLanguages(["fr-FR"]);
    let resolveEnglish: (messages: MessageTree) => void = () => {};
    loadMessageCatalog.mockImplementation((locale) =>
      locale === "en"
        ? new Promise<MessageTree>((resolve) => {
            resolveEnglish = resolve;
          })
        : Promise.resolve(fr),
    );

    renderProbe();
    expect(screen.getByTestId("locale").textContent).toBe("en");

    await waitFor(() =>
      expect(screen.getByTestId("locale").textContent).toBe("fr"),
    );
    const frenchBlocks = screen.getByTestId("blocks").textContent;
    expect(frenchBlocks).not.toBe("Blocks");

    await act(async () => {
      resolveEnglish(en);
    });
    expect(screen.getByTestId("locale").textContent).toBe("fr");
    expect(screen.getByTestId("blocks").textContent).toBe(frenchBlocks);
  });

  it("falls back to English when a catalog chunk fails to load", async () => {
    stubBrowserLanguages(["fr-FR"]);
    loadMessageCatalog.mockImplementation((locale) =>
      locale === "en"
        ? Promise.resolve(en)
        : Promise.reject(new Error("chunk load failed")),
    );

    renderProbe();

    await waitFor(() => expect(loadMessageCatalog).toHaveBeenCalledWith("fr"));
    await act(async () => {});
    expect(screen.getByTestId("locale").textContent).toBe("en");
    expect(screen.getByTestId("blocks").textContent).toBe("Blocks");
  });
});
