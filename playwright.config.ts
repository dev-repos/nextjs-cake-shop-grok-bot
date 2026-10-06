import { randomBytes } from "node:crypto";
import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests against a local production build (run `npm run test:e2e`, which builds first).
 * The server gets a random, throwaway ORDER_SECRET and no Gmail variables, so emails are only
 * written to the server log (.playwright/server.log), never sent.
 */
const PORT = 3200;
process.env.E2E_ORDER_SECRET ??= randomBytes(32).toString("base64url");
process.env.E2E_SERVER_LOG ??= ".playwright/server.log";

export default defineConfig({
  testDir: "tests",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: [["list"]],
  use: {
    ...devices["iPhone 13"],
    browserName: "chromium",
    viewport: { width: 390, height: 844 },
    baseURL: `http://localhost:${PORT}`,
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  webServer: {
    command: `mkdir -p .playwright && next start -p ${PORT} > ${process.env.E2E_SERVER_LOG} 2>&1`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      ORDER_SECRET: process.env.E2E_ORDER_SECRET,
      // Empty Gmail settings force log mode even if they exist in the shell.
      GMAIL_USER: "",
      GMAIL_APP_PASSWORD: "",
      BAKERY_EMAIL: "",
      SITE_URL: "",
    },
  },
});
