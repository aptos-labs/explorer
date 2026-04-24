import {expect, test} from "@playwright/test";

/**
 * Must match the value baked into `dist/client` during `vite build`.
 * CI sets this via workflow env before `pnpm ci:verify` and Playwright.
 * Locally: export the same key you used for `pnpm build`, or rely on skip.
 */
const MAINNET_API_KEY = process.env.VITE_APTOS_MAINNET_API_KEY?.trim();

test.describe("Aptos mainnet API gateway auth (e2e)", () => {
  test.skip(
    !MAINNET_API_KEY,
    "Set VITE_APTOS_MAINNET_API_KEY to the same value used at build time (CI provides it).",
  );

  // Covers FEAT-SETTINGS-001 — geomi `AG-*` keys must use `api-key` on Aptos Labs gateway
  test("mainnet gateway requests send api-key, not Bearer AG-", async ({
    page,
  }) => {
    type Captured = {url: string; apiKey?: string; auth?: string};
    const captured: Captured[] = [];

    page.on("request", (request) => {
      const url = request.url();
      if (!url.includes("api.mainnet.aptoslabs.com")) return;
      const h = request.headers();
      captured.push({
        url,
        apiKey: h["api-key"] ?? h["Api-Key"] ?? h["X-Api-Key"],
        auth: h.authorization ?? h.Authorization,
      });
    });

    await page.goto("/?network=mainnet");
    await expect(page).toHaveTitle(/Aptos Explorer/i);

    await expect
      .poll(() => captured.some((r) => r.apiKey === MAINNET_API_KEY), {
        message:
          "Expected at least one browser request to api.mainnet.aptoslabs.com with api-key matching VITE_APTOS_MAINNET_API_KEY",
        timeout: 60_000,
      })
      .toBe(true);

    const bearerAg = captured.filter((r) =>
      /^bearer\s+AG-/i.test(r.auth ?? ""),
    );
    expect(
      bearerAg,
      "Geomi-style keys must not be sent as Authorization: Bearer (gateway returns 401; Geomi shows 0 usage)",
    ).toHaveLength(0);
  });
});
