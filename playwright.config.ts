import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: "http://localhost:4173" },
  webServer: {
    command: "pnpm preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Headless Chromium has no GPU; SwiftShader gives the town a WebGL context.
        launchOptions: {
          args: [
            "--enable-unsafe-swiftshader",
            "--use-angle=swiftshader",
            "--ignore-gpu-blocklist",
          ],
        },
      },
    },
  ],
});
