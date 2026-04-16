import {defineConfig, devices} from "@playwright/test";

const port = 4173;
const baseURL = `http://127.0.0.1:${port}`;

/**
 * E2E tests run against a production build (`vite preview`).
 * Set the same Aptos API Gateway key for both `VITE_APTOS_*` (client bundle)
 * and `APTOS_*` (SSR) in CI so browser and server share one identity and
 * avoid extra rate-limit pressure from mismatched keys.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{name: "chromium", use: {...devices["Desktop Chrome"]}}],
  webServer: {
    command: `pnpm exec vite preview --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
