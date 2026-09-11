import {expect, test} from "@playwright/test";

/**
 * FEAT-TXN-016 — Payments tab explains network fees on a user transaction.
 * Uses the same fixed testnet version as the Balance Change e2e (gas-fee FA activity).
 *
 * CI runs `pnpm build` with `VITE_APTOS_TESTNET_API_KEY` then Playwright against
 * `vite preview`. Locally the Aptos gateway may return 401 for
 * `Origin: http://127.0.0.1:4173` — skip in that case outside CI.
 */
test.describe("transaction payments tab", () => {
  test("testnet txn payments tab explains fees", async ({page}) => {
    test.setTimeout(120_000);

    await page.goto("/txn/8529641783/payments?network=testnet", {
      waitUntil: "domcontentloaded",
    });

    const payments = page.locator('[data-entity-type="payments"]');
    const errorHeading = page.getByRole("heading", {
      name: "Error Loading Transaction",
    });

    await expect(payments.or(errorHeading).first()).toBeVisible({
      timeout: 90_000,
    });

    if (await errorHeading.isVisible()) {
      const errText = await page.getByRole("main").textContent();
      test.skip(
        /401|Unauthorized/i.test(errText ?? "") && process.env.CI !== "true",
        "Testnet gateway returned 401 for this preview origin; full assertion runs in CI",
      );
      await expect(
        errorHeading,
        "Transaction must load (CI builds with VITE_APTOS_TESTNET_API_KEY)",
      ).not.toBeVisible();
    }

    await expect(payments).toBeVisible();
    await expect(page.getByRole("tab", {name: /Payments/i})).toBeVisible();
    await expect(payments.getByLabel("Payment fees")).toBeVisible();
    await expect(payments.getByText(/Net network fee/i).first()).toBeVisible();
  });
});
