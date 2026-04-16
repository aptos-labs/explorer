import {expect, test} from "@playwright/test";

test.describe("smoke", () => {
  test("home page loads with Aptos Explorer title", async ({page}) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Aptos Explorer/i);
  });

  test("network search param is preserved for mainnet default routes", async ({
    page,
  }) => {
    await page.goto("/?network=testnet");
    await expect(page).toHaveURL(/network=testnet/);
  });

  test("main nav opens Blocks", async ({page}) => {
    await page.goto("/");
    await page
      .getByRole("navigation", {name: "Main navigation"})
      .getByRole("button", {name: "Blocks"})
      .click();
    await expect(page).toHaveURL(/\/blocks/);
  });
});
