import { test, expect } from '@playwright/test';

const root = "https://explorer.movementlabs.xyz/"
const pageTitle = "Movement M1 Explorer"

function health_log({
  health_check,
  status,
  group = "movement-explorer",
  reason
} : {
  health_check : string,
  status : "PASS" | "FAIL",
  group ? : string,
  reason : string
}){

  console.log(
    `health_check="${health_check}" status="${status}" group="${group}" reason="${reason}""`
  )

}

test('exists', async ({ page }) => {
  const successful = await page.goto(root);
  health_log({
    health_check: "exists",
    status: successful ? "PASS" : "FAIL",
    reason: "page exists"
  })
  await expect(page).toHaveTitle(/Movement M1 Explorer/);
});

test('has title', async ({ page }) => {
  await page.goto(root);

  const title = await page.title();
  health_log({
    health_check: "has-title",
    status: title === pageTitle ? "PASS" : "FAIL",
    reason: "title is present"
  })

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Movement M1 Explorer/);

});

test('clicks connect', async ({ page }) => {
  await page.goto(root);

  // Click the get started link.
  await page.getByText('CONNECT WALLET').click();
  const res = await page.waitForSelector('text=mvmt_m1 only', {
    timeout : 1000
  });

  health_log({
    health_check: "clicks-connect",
    status: res ? "PASS" : "FAIL",
    reason: "clicks connect button"
  })

  // Expects page to have a heading with the name of Installation.
  await expect(res).toBeDefined();

});

test('toggles light mode', async ({ page }) => {
  await page.goto(root);

  // Click the get checkpoints link.
  const toggle = await page.getByAltText("light-mode-toggle");
  const isChecked = await toggle.isChecked();
  toggle.click();
  const res = await toggle.isChecked() != isChecked;
  health_log({
    health_check: "opens-checkpoints",
    status: res ? "PASS" : "FAIL",
    reason: "can open checkpoints"
  })

  // Expects page to have a heading with the name of Installation.
  await expect(res).toBeDefined();
});

test('clicks blocks', async ({ page }) => {
  await page.goto(root);

  // Click the get started link.
  await page.getByText('Blocks').click();
  const res = await page.waitForSelector('text=Latest Blocks', {
    timeout : 1000
  });

  health_log({
    health_check: "clicks-blocks",
    status: res ? "PASS" : "FAIL",
    reason: "clicks blocks tab"
  })

  // Expects page to have a heading with the name of Installation.
  await expect(res).toBeDefined();

});

test('clicks transactions', async ({ page }) => {
  await page.goto(root);

  // Click the get started link.
  await page.getByText('Transactions').click();
  const res = await page.waitForSelector('text=All Transactions', {
    timeout : 1000
  });

  health_log({
    health_check: "clicks-transactions",
    status: res ? "PASS" : "FAIL",
    reason: "clicks transactions tab"
  })

  // Expects page to have a heading with the name of Installation.
  await expect(res).toBeDefined();

});