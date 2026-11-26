# 0011: Build and tooling

### React is pinned to an exact version

Where: `package.json` `react`, `react-dom`; `src/boot/react-pin.test.ts`

pnpm-lock.yaml is gitignored, so package.json alone decides what Vercel installs. React Three Fiber 9 supports only React 19.0 up to 19.3, so React and its types are pinned to exact 19.3 releases and a test fails if a caret range returns.

### Test cleanup is registered by hand

Where: `src/test/setup.ts`

Vitest runs without globals, so Testing Library cannot register its own cleanup. The setup file unmounts rendered trees and clears saved state after each test.

### Bundle budgets cover load sets, not files

Where: `scripts/budgets.mjs` `BUDGETS`

`initial` is everything a phone loads before the story is readable and must hold no React. `town`, `hud` and `world` load when idle in Story or at once in Explore and never in Text, and `effects` loads on High only, so each budget is for a set of chunks counted once.

### Posters are captured by script from a scratch sharp install

Where: `scripts/poster.mjs`

The still images Story shows before the canvas is ready are captured by this script after a visual change to the town, not at build time, and are committed. sharp is not a project dependency and comes from a scratch install; each webp must stay under 60000 bytes and gets an AVIF twin that story.css prefers.

### Structured data escapes the less-than sign

Where: `scripts/prerender.mjs` `jsonLd`

The JSON-LD is inlined in a script element with every `<` escaped as `\u003c`, so no string in the data can close the element early.

### The chunk import graph stays out of dist

Where: `vite.config.ts` import-graph plugin; `scripts/check-budgets.mjs`

The build writes which chunks import which for the budget check, outside dist so it is never deployed.

### The chunk size warning limit is raised to 800 KB

Where: `vite.config.ts` `build.chunkSizeWarningLimit`

three.js is one chunk of about 740 KB by design, so Vite's chunk-size warning is raised to 800 KB. The size gate that matters is `scripts/check-budgets.mjs`.
