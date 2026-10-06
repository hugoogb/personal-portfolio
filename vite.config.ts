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

export default defineConfig({
  plugins: [react(), tailwindcss(), injectHeadScript()],
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
