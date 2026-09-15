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

  test("header language select is available", async ({page}) => {
    await page.goto("/");
    await expect(page.getByRole("combobox", {name: "Language"})).toBeVisible();
  });

  test("user guide page is reachable", async ({page}) => {
    await page.goto("/guide");
    await expect(
      page.getByRole("heading", {level: 1, name: /User Guide/i}),
    ).toBeVisible();
  });

  // Covers FEAT-GUIDE-001 / FEAT-CHROME-001 — no sideways pan into empty space
  test("user guide does not overflow horizontally", async ({page}) => {
    await page.goto("/guide");
    await expect(
      page.getByRole("heading", {level: 1, name: /User Guide/i}),
    ).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("user guide does not overflow horizontally on a narrow viewport", async ({
    page,
  }) => {
    await page.setViewportSize({width: 375, height: 812});
    await page.goto("/guide");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
