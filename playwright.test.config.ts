import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./test",
  outputDir: "/tmp/pw-results",
  fullyParallel: true,
  reporter: [["list"]],
  use: { trace: "off" },
  webServer: {
    command: "npx vite --config vite.test.config.ts",
    url: "http://localhost:8080",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
