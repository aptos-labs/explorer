import {expect, test} from "@playwright/test";

/**
 * FEAT-TXN-003 — Balance Change tab must load indexer `fungible_asset_activities`.
 * Regression: GraphQL `transaction_version` must use `bigint`, not `String`, or Hasura
 * rejects the query and the tab shows only "No Data Found".
 *
 * Uses a fixed successful testnet version known to have at least a gas-fee FA activity
 * in the indexer (see PR discussion / Slack #explorer).
 *
 * CI runs `pnpm build` with `VITE_APTOS_TESTNET_API_KEY` then Playwright against
 * `vite preview` on 127.0.0.1. Locally, the Aptos gateway may return 401 for
 * `Origin: http://127.0.0.1:4173` even with a key — we skip in that case outside CI.
 */
test.describe("transaction balance change tab", () => {
  test("testnet txn shows balance changes table (indexer data)", async ({
    page,
  }) => {
    test.setTimeout(120_000);

    await page.goto("/txn/8529641783/balanceChange?network=testnet", {
      waitUntil: "domcontentloaded",
    });

    const balanceTable = page.locator(
      'table[aria-label="Balance changes"][data-entity-type="balance-change"]',
    );
    const errorHeading = page.getByRole("heading", {
      name: "Error Loading Transaction",
    });

    await expect(balanceTable.or(errorHeading).first()).toBeVisible({
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

    await expect(balanceTable).toBeVisible();
    await expect(page.getByText("No Data Found")).not.toBeVisible();
    // Gas fee row from indexer (`convertType` → "Gas Fee")
    await expect(
      balanceTable.getByText("Gas Fee", {exact: true}),
    ).toBeVisible();
  });
});
