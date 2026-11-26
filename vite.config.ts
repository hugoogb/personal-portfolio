import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { headScript } from "./src/boot/head.ts";

const HEAD_SCRIPT_SLOT = "<!-- head-script -->";

const posterPreload = `<script>(function(){var c=document.documentElement.classList;if(c.contains("mode-text"))return;var l=document.createElement("link");l.rel="preload";l.as="image";l.fetchPriority="high";l.type="image/avif";l.href="/posters/town-"+(c.contains("night")?"night":"day")+"-"+(matchMedia("(max-aspect-ratio: 3/4)").matches?"tall":"wide")+".avif";document.head.appendChild(l)})()</script>`;

const injectHeadScript = (): Plugin => ({
  name: "base-camp-head-script",
  transformIndexHtml(html) {
    if (!html.includes(HEAD_SCRIPT_SLOT)) {
      throw new Error(`index.html is missing ${HEAD_SCRIPT_SLOT}`);
    }
    return html.replace(HEAD_SCRIPT_SLOT, `<script>${headScript}</script>${posterPreload}`);
  },
});

const BENCHMARKS_DIR = path.resolve(import.meta.dirname, "node_modules/detect-gpu/dist/benchmarks");

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

const preloadFonts = (): Plugin => ({
  name: "base-camp-preload-fonts",
  transformIndexHtml: {
    order: "post",
    handler(_html, ctx) {
      if (!ctx.bundle) return;
      return Object.keys(ctx.bundle)
        .filter((file) =>
          /(hanken-grotesk-latin-wght|raleway-latin-wght)-normal-.*\.woff2$/.test(file),
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

const preloadTown = (): Plugin => ({
  name: "base-camp-preload-town",
  transformIndexHtml: {
    order: "post",
    handler(html, ctx) {
      if (!ctx.bundle) return;
      const chunks = Object.values(ctx.bundle).filter((o) => o.type === "chunk");
      const entry = chunks.find((c) => c.isEntry);
      const byName = (name: string) => chunks.find((c) => c.name === name);
      const loaded = new Set<string>(entry ? [entry.fileName, ...entry.imports] : []);
      const files: string[] = [];
      const visit = (file: string) => {
        if (loaded.has(file)) return;
        loaded.add(file);
        files.push(file);
        const chunk = ctx.bundle![file];
        if (chunk?.type === "chunk") chunk.imports.forEach(visit);
      };
      for (const name of ["TownApp", "World", "Hud"]) {
        const chunk = byName(name);
        if (chunk) visit(chunk.fileName);
      }
      if (!files.length) return;
      const hrefs = JSON.stringify(files.map((f) => `/${f}`));
      const fonts = JSON.stringify(
        Object.keys(ctx.bundle)
          .filter((f) => /barlow-condensed-latin-600-normal-.*\.woff2$/.test(f))
          .map((f) => `/${f}`),
      );
      const script = `<script>if(document.documentElement.classList.contains("mode-explore")){for(const h of ${hrefs}){const l=document.createElement("link");l.rel="modulepreload";l.crossOrigin="";l.href=h;document.head.appendChild(l)}for(const h of ${fonts}){const l=document.createElement("link");l.rel="preload";l.as="font";l.type="font/woff2";l.crossOrigin="";l.href=h;document.head.appendChild(l)}}</script>`;
      const head = html.indexOf(headScript.slice(0, 40));
      if (head < 0) throw new Error("preloadTown: the head script is not in index.html");
      const at = html.indexOf("</script>", head);
      return html.slice(0, at + 9) + script + html.slice(at + 9);
    },
  },
});

const R3F_CANVAS = /@react-three[/\\]fiber[/\\]dist[/\\]react-three-fiber\.esm\.js$/;
const CATALOGUE = path.resolve(import.meta.dirname, "src/world/lib/catalogue.ts");

const redirectToCatalogue = (source: string, importer: string | undefined) =>
  source === "three" && importer && R3F_CANVAS.test(importer) ? CATALOGUE : null;

const threeCatalogue = (): Plugin => {
  let ssr = false;
  let redirected = false;
  return {
    name: "base-camp-three-catalogue",
    enforce: "pre",
    configResolved(config) {
      ssr = Boolean(config.build.ssr);
    },
    resolveId(source, importer) {
      const id = redirectToCatalogue(source, importer);
      if (id) redirected = true;
      return id;
    },
    generateBundle() {
      if (!ssr && !redirected)
        this.error("threeCatalogue: R3F's Canvas no longer imports three; check catalogue.ts");
    },
  };
};

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
      const dir = path.resolve(import.meta.dirname, "node_modules/.cache/base-camp");
      mkdirSync(dir, { recursive: true });
      writeFileSync(path.join(dir, "bundle-report.json"), JSON.stringify({ chunks }, null, 2));
    },
  };
};

export default defineConfig({
  plugins: [
    threeCatalogue(),
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
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  optimizeDeps: {
    rolldownOptions: {
      plugins: [{ name: "base-camp-three-catalogue", resolveId: redirectToCatalogue }],
    },
  },
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("/react-dom/") || id.includes("/react/")) return "react-vendor";
          return undefined;
        },
      },
    },
  },
});
