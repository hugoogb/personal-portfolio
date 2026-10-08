import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
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

/**
 * Preloads the fonts the first paint is set in: the two variable fonts of the
 * Brief and the HUD's label face. Without it
 * the text paints in the fallback face and then jumps when the font arrives,
 * which is a layout shift; with it the font is in flight from the first byte
 * of HTML. Build only: in dev the fonts are served from node_modules.
 */
const preloadFonts = (): Plugin => ({
  name: "base-camp-preload-fonts",
  transformIndexHtml: {
    order: "post",
    handler(_html, ctx) {
      if (!ctx.bundle) return;
      return Object.keys(ctx.bundle)
        .filter((file) =>
          /(hanken-grotesk-latin-wght|raleway-latin-wght|barlow-condensed-latin-600)-normal-.*\.woff2$/.test(
            file,
          ),
        )
        .map((file) => ({
          tag: "link",
          attrs: {
            rel: "preload",
            as: "font",
            type: "font/woff2",
            crossorigin: "",
            href: `/${file}`,
          },
          injectTo: "head" as const,
        }));
    },
  },
});

/**
 * Starts the town's chunks downloading from the HTML itself, before the entry
 * script has even run: Boot would otherwise ask for them only once React had
 * rendered. An inline script after the head script preloads them only when
 * that script chose the town (html.can-world), so Brief-only visitors (no
 * WebGL, reduced motion, Save-Data) never fetch them. The effects chunk is
 * left to Boot, which knows the tier.
 */
const preloadTown = (): Plugin => ({
  name: "base-camp-preload-town",
  transformIndexHtml: {
    order: "post",
    handler(html, ctx) {
      if (!ctx.bundle) return;
      const chunks = Object.values(ctx.bundle).filter((o) => o.type === "chunk");
      const entry = chunks.find((c) => c.isEntry);
      const byName = (name: string) => chunks.find((c) => c.name === name);
      // What the entry imports statically is already preloaded by Vite.
      const loaded = new Set<string>(entry ? [entry.fileName, ...entry.imports] : []);
      const files: string[] = [];
      const visit = (file: string) => {
        if (loaded.has(file)) return;
        loaded.add(file);
        files.push(file);
        const chunk = ctx.bundle![file];
        if (chunk?.type === "chunk") chunk.imports.forEach(visit);
      };
      for (const name of ["World", "Hud"]) {
        const chunk = byName(name);
        if (chunk) visit(chunk.fileName);
      }
      if (!files.length) return;
      const hrefs = JSON.stringify(files.map((f) => `/${f}`));
      const script = `<script>if(document.documentElement.classList.contains("can-world"))for(const h of ${hrefs}){const l=document.createElement("link");l.rel="modulepreload";l.crossOrigin="";l.href=h;document.head.appendChild(l)}</script>`;
      // Straight after the head script, which sets can-world: an inline script after the
      // stylesheet would wait for it to load before it ran.
      const head = html.indexOf(headScript.slice(0, 40));
      if (head < 0) throw new Error("preloadTown: the head script is not in index.html");
      const at = html.indexOf("</script>", head);
      return html.slice(0, at + 9) + script + html.slice(at + 9);
    },
  },
});

/**
 * Writes which chunks import which, for scripts/check-budgets.mjs (spec 10).
 * Kept out of dist so it is never deployed.
 */
const bundleReport = (): Plugin => {
  let ssr = false;
  return {
    name: "base-camp-bundle-report",
    configResolved(config) {
      ssr = Boolean(config.build.ssr);
    },
    writeBundle(_options, bundle) {
      if (ssr) return;
      const chunks: Record<
        string,
        { name: string; isEntry: boolean; imports: string[]; dynamicImports: string[] }
      > = {};
      for (const [file, out] of Object.entries(bundle)) {
        if (out.type !== "chunk") continue;
        chunks[file] = {
          name: out.name,
          isEntry: out.isEntry,
          imports: out.imports,
          dynamicImports: out.dynamicImports,
        };
      }
      const dir = path.resolve(__dirname, "node_modules/.cache/base-camp");
      mkdirSync(dir, { recursive: true });
      writeFileSync(path.join(dir, "bundle-report.json"), JSON.stringify({ chunks }, null, 2));
    },
  };
};

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    injectHeadScript(),
    detectGpuBenchmarks(),
    bundleReport(),
    preloadFonts(),
    preloadTown(),
  ],
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
