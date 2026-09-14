import {expect, test} from "@playwright/test";

/**
 * FEAT-TXN-016 — Payments tab is offered only when a payment is identified.
 *
 * CI runs `pnpm build` with `VITE_APTOS_TESTNET_API_KEY` then Playwright against
 * `vite preview`. Locally the Aptos gateway may return 401 for
 * `Origin: http://127.0.0.1:4173` — skip in that case outside CI.
 */

const FEE_ONLY_TESTNET_VERSION = "8529641783";

const INDEXER_URLS = [
  "https://api.testnet.aptoslabs.com/v1/graphql",
  "https://api.testnet.staging.aptoslabs.com/v1/graphql",
];

async function latestTestnetP2pVersion(): Promise<string | undefined> {
  const body = JSON.stringify({
    query: `query {
      user_transactions(
        where: {entry_function_id_str: {_eq: "0x1::aptos_account::transfer"}}
        order_by: {version: desc}
        limit: 1
      ) { version }
    }`,
  });
  for (const url of INDEXER_URLS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body,
      });
      if (!res.ok) continue;
      const json = (await res.json()) as {
        data?: {user_transactions?: {version?: string | number}[]};
      };
      const version = json.data?.user_transactions?.[0]?.version;
      if (version != null) return String(version);
    } catch {
      // try the next indexer host
    }
  }
  return undefined;
}

async function skipIfUnauthorized(page: import("@playwright/test").Page) {
  const errorHeading = page.getByRole("heading", {
    name: "Error Loading Transaction",
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
}

test.describe("transaction payments tab", () => {
  test("hides the Payments tab when no payment is identified", async ({
    page,
  }) => {
    test.setTimeout(120_000);

    await page.goto(
      `/txn/${FEE_ONLY_TESTNET_VERSION}/payments?network=testnet`,
      {waitUntil: "domcontentloaded"},
    );

    const overviewTab = page.getByRole("tab", {name: /Overview/i});
    const errorHeading = page.getByRole("heading", {
      name: "Error Loading Transaction",
    });
    await expect(overviewTab.or(errorHeading).first()).toBeVisible({
      timeout: 90_000,
    });
    await skipIfUnauthorized(page);

    await expect(overviewTab).toBeVisible();
    await expect(page).toHaveURL(
      new RegExp(`/txn/${FEE_ONLY_TESTNET_VERSION}/overview`),
    );
    await expect(page.getByRole("tab", {name: /Payments/i})).toHaveCount(0);
    await expect(page.locator('[data-entity-type="payments"]')).toHaveCount(0);
  });

  test("shows the Payments tab for a peer-to-peer transfer", async ({page}) => {
    test.setTimeout(120_000);

    const version = await latestTestnetP2pVersion();
    if (!version) {
      test.skip(
        process.env.CI !== "true",
        "Testnet indexer did not return a recent aptos_account::transfer",
      );
      expect(
        version,
        "CI must resolve a recent testnet P2P transfer",
      ).toBeTruthy();
      return;
    }

    await page.goto(`/txn/${version}/payments?network=testnet`, {
      waitUntil: "domcontentloaded",
    });

    const payments = page.locator('[data-entity-type="payments"]');
    const errorHeading = page.getByRole("heading", {
      name: "Error Loading Transaction",
    });
    await expect(payments.or(errorHeading).first()).toBeVisible({
      timeout: 90_000,
    });
    await skipIfUnauthorized(page);

    await expect(page.getByRole("tab", {name: /Payments/i})).toBeVisible();
    await expect(payments).toBeVisible();
    await expect(payments.getByText(/Peer-to-peer/i).first()).toBeVisible();
    await expect(payments.getByLabel("Payment fees")).toBeVisible();
  });
});
