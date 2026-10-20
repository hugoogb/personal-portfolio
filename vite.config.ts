import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { headScript } from "./src/boot/head";

const HEAD_SCRIPT_SLOT = "<!-- head-script -->";

/**
 * Preloads the still image of the town that Story shows until the canvas is
 * ready (spec 6.1): the night or day one, wide or tall, unless the head script
 * chose Text. The media query is the one story.css picks the image with.
 */
const posterPreload = `<script>(function(){var c=document.documentElement.classList;if(c.contains("mode-text"))return;var l=document.createElement("link");l.rel="preload";l.as="image";l.fetchPriority="high";l.href="/posters/town-"+(c.contains("night")?"night":"day")+"-"+(matchMedia("(max-aspect-ratio: 3/4)").matches?"tall":"wide")+".webp";document.head.appendChild(l)})()</script>`;

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
    return html.replace(HEAD_SCRIPT_SLOT, `<script>${headScript}</script>${posterPreload}`);
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
 * story document. The HUD's label face is preloaded by preloadTown, in Explore
 * only: Story and Text never show it before Explore is picked. Without it
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

/**
 * Starts the town's chunks and the HUD's font downloading from the HTML itself,
 * before the entry script has even run: Town would otherwise ask for them once
 * React had rendered. An inline script after the head script preloads them only when
 * that script chose Explore (html.mode-explore), where the town is the page.
 * Story loads them when the browser is idle, and a preload would compete with
 * the still image and the fonts on a slow connection; Text never fetches them.
 * The effects chunk is left to Town, which knows the tier.
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
      // The HUD's label face, which only Explore shows on arrival.
      const fonts = JSON.stringify(
        Object.keys(ctx.bundle)
          .filter((f) => /barlow-condensed-latin-600-normal-.*\.woff2$/.test(f))
          .map((f) => `/${f}`),
      );
      const script = `<script>if(document.documentElement.classList.contains("mode-explore")){for(const h of ${hrefs}){const l=document.createElement("link");l.rel="modulepreload";l.crossOrigin="";l.href=h;document.head.appendChild(l)}for(const h of ${fonts}){const l=document.createElement("link");l.rel="preload";l.as="font";l.type="font/woff2";l.crossOrigin="";l.href=h;document.head.appendChild(l)}}</script>`;
      // Straight after the head script, which sets the mode: an inline script after the
      // stylesheet would wait for it to load before it ran.
      const head = html.indexOf(headScript.slice(0, 40));
      if (head < 0) throw new Error("preloadTown: the head script is not in index.html");
      const at = html.indexOf("</script>", head);
      return html.slice(0, at + 9) + script + html.slice(at + 9);
    },
  },
});

const R3F_CANVAS = /@react-three[/\\]fiber[/\\]dist[/\\]react-three-fiber\.esm\.js$/;
const CATALOGUE = path.resolve(__dirname, "src/world/lib/catalogue.ts");

/**
 * R3F's Canvas calls `extend(THREE)` with `import * as THREE from "three"`, which
 * keeps all of three.js in the bundle (about 50 KB gzipped of classes the town
 * never uses). That import is the file's only use of three, so it is pointed at
 * src/world/lib/catalogue.ts, the classes the JSX names. The dev server's
 * dependency pre-bundling gets the same redirect, so dev fails like the build
 * when a tag is missing. The build stops if R3F stops importing three that way.
 */
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
      if (source !== "three" || !importer || !R3F_CANVAS.test(importer)) return null;
      redirected = true;
      return CATALOGUE;
    },
    generateBundle() {
      if (!ssr && !redirected)
        this.error("threeCatalogue: R3F's Canvas no longer imports three; check catalogue.ts");
    },
  };
};

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
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        {
          name: "base-camp-three-catalogue",
          setup(build) {
            build.onResolve({ filter: /^three$/ }, (args) =>
              R3F_CANVAS.test(args.importer) ? { path: CATALOGUE } : undefined,
            );
          },
        },
      ],
    },
  },
  build: {
    outDir: "dist",
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
