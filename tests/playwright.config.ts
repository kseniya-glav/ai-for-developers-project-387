import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  fullyParallel: false,
  retries: 0,
  timeout: 60000,
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "cd ../backend && npm run dev",
      port: 3000,
      reuseExistingServer: false,
    },
    {
      command: "cd ../frontend && npm run dev",
      port: 5173,
      reuseExistingServer: false,
    },
  ],
});
