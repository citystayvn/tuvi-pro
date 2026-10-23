import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

const PORT = Number(process.env.PORT ?? 3200);
const localChromium = "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    launchOptions: existsSync(localChromium) ? { executablePath: localChromium } : {},
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npx next build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
