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

  test("header language icon is available on desktop", async ({page}) => {
    await page.goto("/");
    await expect(page.getByRole("button", {name: "Language"})).toBeVisible();
  });

  test("language control is in the overflow menu on a narrow viewport", async ({
    page,
  }) => {
    await page.setViewportSize({width: 375, height: 812});
    await page.goto("/");
    await expect(page.getByRole("button", {name: "Language"})).toHaveCount(0);
    await page.getByRole("button", {name: "Navigation menu"}).click();
    await expect(page.getByRole("menuitem", {name: "Language"})).toBeVisible();
  });

  // Covers FEAT-CHROME-001 / FEAT-NETWORK-001 — compact header menus on phones
  test("hamburger and network dropdown open on a narrow viewport", async ({
    page,
  }) => {
    await page.setViewportSize({width: 375, height: 812});
    await page.goto("/");
    const hamburger = page.getByRole("button", {name: "Navigation menu"});
    const hamburgerBox = await hamburger.boundingBox();
    expect(hamburgerBox?.width).toBeGreaterThanOrEqual(44);
    expect(hamburgerBox?.width).toBeLessThanOrEqual(56);
    expect(hamburgerBox?.height).toBeGreaterThanOrEqual(44);
    expect(hamburgerBox?.height).toBeLessThanOrEqual(56);
    await hamburger.click();
    await expect(
      page.getByRole("menuitem", {name: "Transactions"}),
    ).toBeVisible();
    expect(
      await page.evaluate(() => getComputedStyle(document.body).overflow),
    ).not.toBe("hidden");
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("menuitem", {name: "Transactions"}),
    ).toHaveCount(0);
    await page.getByLabel("Select network").click();
    await expect(page.getByRole("option", {name: /testnet/i})).toBeVisible();
    expect(
      await page.evaluate(() => getComputedStyle(document.body).overflow),
    ).not.toBe("hidden");
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
