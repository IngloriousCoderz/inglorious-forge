import process from "node:process"

import { defineConfig, devices } from "@playwright/test"

const CI_RETRIES = 2
const LOCAL_RETRIES = 0
const PREVIEW_PORT = 4173

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? CI_RETRIES : LOCAL_RETRIES,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${PREVIEW_PORT}`,
    trace: "on-first-retry",
  },
  webServer: {
    command: `pnpm preview --host 127.0.0.1 --port ${PREVIEW_PORT}`,
    port: PREVIEW_PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
