import { readFileSync, readdirSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { headScript } from "./src/boot/head";

const HEAD_SCRIPT_SLOT = "<!-- head-script -->";

/**
 * Puts src/boot/head.ts into index.html as an inline script, in dev and build
 * alike, so the code that runs before first paint is the code the tests cover.
 */
const injectHeadScript = (): Plugin => ({
  name: "base-camp-head-script",
  transformIndexHtml(html) {
    if (!html.includes(HEAD_SCRIPT_SLOT)) {
      throw new Error(`index.html is missing ${HEAD_SCRIPT_SLOT}`);
    }
    return html.replace(HEAD_SCRIPT_SLOT, `<script>${headScript}</script>`);
  },
});

const BENCHMARKS_DIR = path.resolve(__dirname, "node_modules/detect-gpu/dist/benchmarks");

/**
 * detect-gpu looks the visitor's GPU up in benchmark tables it would otherwise
 * fetch from unpkg. Serving them from this site keeps a third party out of the
 * boot path (spec section 8): from node_modules in dev, as emitted assets in
 * the client build. The SSR build does not need them.
 */
const detectGpuBenchmarks = (): Plugin => {
  let ssr = false;
  return {
    name: "base-camp-detect-gpu-benchmarks",
    configResolved(config) {
      ssr = Boolean(config.build.ssr);
    },
    configureServer(server) {
      server.middlewares.use("/benchmarks", (req, res, next) => {
        const file = path.basename((req.url ?? "").split("?")[0]);
        if (!file.endsWith(".json")) return next();
        try {
          res.setHeader("content-type", "application/json");
          res.end(readFileSync(path.join(BENCHMARKS_DIR, file)));
        } catch {
          next();
        }
      });
    },
    generateBundle() {
      if (ssr) return;
      for (const file of readdirSync(BENCHMARKS_DIR)) {
        if (!file.endsWith(".json")) continue;
        this.emitFile({
          type: "asset",
          fileName: `benchmarks/${file}`,
          source: readFileSync(path.join(BENCHMARKS_DIR, file)),
        });
      }
    },
  };
};

export default defineConfig({
  plugins: [react(), tailwindcss(), injectHeadScript(), detectGpuBenchmarks()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("/react-dom/") || id.includes("/react/")) return "react-vendor";
          if (id.includes("/motion/")) return "motion-vendor";
          if (id.includes("/@tabler/icons-react/")) return "icons-vendor";
          if (id.includes("/react-icons/")) return "icons-vendor";
          if (id.includes("/@vercel/analytics/") || id.includes("/@vercel/speed-insights/"))
            return "vercel-vendor";
          return undefined;
        },
      },
    },
  },
});
