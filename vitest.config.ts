import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

// Tests run through the app's own Vite config, so the "@" alias and asset imports
// (the project screenshots) resolve exactly as they do in the build.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "node",
      include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.mjs"],
      restoreMocks: true,
      setupFiles: ["src/test/setup.ts"],
    },
  }),
);
