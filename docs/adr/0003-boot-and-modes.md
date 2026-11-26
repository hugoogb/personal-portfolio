# 0003: Boot and modes

### The client entry has no React and never hydrates

Where: `src/main.ts`

Production HTML arrives with the story document prerendered by `scripts/prerender.mjs`. It is static, so the client never hydrates it and the entry imports no React. The dev server serves an empty `#root`, so `main.ts` renders the story there in dev only, behind `import.meta.env.DEV`, so it never ships.

### The story stylesheet is imported by the entry

Where: `src/main.ts`, `src/story/story.css`

The client never imports the prerendered story components, so their layout (and the mode switch's) would never be bundled. `main.ts` imports `story.css` so it ships render-blocking, like the page's own CSS.

### Fonts are self-hosted

Where: `src/main.ts`, `src/styles/fonts.css`, `scripts/fonts.py`

A Google Fonts stylesheet blocks first paint behind two extra connections. The two story faces ship in the site's CSS instead, cut to the weights in use by `scripts/fonts.py`.

### The head script is self-contained

Where: `src/boot/head.ts` `bootHead`, `headScript`; `vite.config.ts`

`bootHead` runs inline in `<head>` before first paint and is shipped as its own source text (`bootHead.toString()`), so it may use only its parameters and globals, with no module-level helpers. `vite.config.ts` imports `head.ts`, so `head.ts` imports `sun.ts` by a relative path, and keeps the explore-only slugs as a literal because the config cannot load the content (it imports images). `head.test.ts` checks that literal against `EXPLORE_ONLY_SLUGS` in `tour.ts`, and the `bc-town-failed` key is repeated rather than imported from `src/boot/world.ts`.

### The head script never touches WebGL

Where: `src/boot/head.ts` `bootHead`; `src/boot/Town.tsx` `start`; `src/story/transitions.ts` `hasWebgl`

Creating a WebGL context blocks first paint for about a second on a slow device, so the head script picks the mode without probing. Town probes for WebGL2 after first paint; without it the story stays on the still image, `html.no-webgl` is set and Explore says why it is off. Until that probe has run, `transitions.ts` gives the device the benefit of the doubt.

### Barcelona's hour is computed without Intl

Where: `src/boot/head.ts` `bootHead`

The `night` class uses Barcelona's hour from UTC under the EU rule: CET, and CEST from the last Sunday of March to the last Sunday of October, both switching at 01:00 UTC. Intl is avoided because its first use with a time zone loads the zone data, about 20 ms before first paint on a slow phone.

### Story loads the town only after first paint

Where: `src/boot/Town.tsx` `Town`

Text never loads the town. Explore starts loading at once, but Story waits for a frame, a task after it and an idle callback, so the text and the still image get the network and the main thread first. The ready timer is armed inside `start`, so that wait does not count against `READY_TIMEOUT_MS`.

### The town's chunks download in parallel with the GPU check

Where: `src/boot/Town.tsx` `start`

The world chunk's import starts before `readSignals`, so the code downloads while the GPU check runs. On High the effects chunk is fetched alongside it so it is in by the first frame; a failure there is left to the world's own import, whose boundary drops the effects.

### The boot timeout counts only visible time

Where: `src/boot/Town.tsx` `arm`

`READY_TIMEOUT_MS` bounds the GPU check, chunk loading and the first frame. A hidden tab draws no frames, so the timer re-arms while `document.hidden` and only a visible tab can time out.

### A failed town is remembered for the session

Where: `src/boot/Town.tsx` `off`, `failedThisSession`; `src/boot/head.ts` `bootHead`

When the town times out or crashes, `off(true)` writes `TOWN_FAILED_KEY` to sessionStorage. The head script and Town both read it, so a reload keeps the still image instead of building, compiling and waiting all over again; when storage is blocked, the next load simply tries again.

### Turning the town off

Where: `src/boot/Town.tsx` `off`

`off` clears `started` because choosing Explore after Lite puts the town back to "loading", and it must then start again. Leaving Explore this way returns to Story where Explore left it, as a fallback (`chosen: false`) rather than the visitor's choice. Picking Lite removes the button that had focus, so focus moves to the mode switch's checked radio.

### Interrupted boots and builds start over

Where: `src/boot/Town.tsx` boot effect cleanup; `src/world/World.tsx` build effect

A boot interrupted before it settles (StrictMode's rehearsal unmount, or Text mid-load) clears `started` and the ready timer, so it starts over next time. World builds in an effect so the rehearsal disposes a world that is then rebuilt, and a build that finishes after unmount disposes its own kit, since nothing else will.

### The HUD loads only for Explore and waits for the first frame

Where: `src/boot/Town.tsx` `loadHud`, `hudWanted`

Only Explore shows the HUD, so Story never downloads it, its stylesheet or its label font. In Explore it is fetched alongside the world so it is in by the first frame, and it mounts only once the town is "ready"; until then the still image shows.

### The first frame is drawn even in a hidden tab

Where: `src/world/World.tsx` `paused`

The Pacer pauses while the tab is hidden, but only after the first frame has been drawn, so boot can finish and report ready.

### What can block Explore

Where: `src/story/transitions.ts` `exploreBlocked`, `liteOff`, `enterExplore`

Explore is blocked only without WebGL2 or after the town failed. A town that is still loading, or that Lite turned off, can be chosen from any mode, and choosing Explore after Lite brings the 3D back at the device's own tier, or at Low when the device's own pick was Lite too.

### Leaving Explore returns to the saved scroll position

Where: `src/story/transitions.ts` `left`, `stopLeavingExplore`

Explore's layout pins the page to the top, so entering Explore from Story saves the scroll position and stop. Leaving Explore for the same place returns to that exact position; otherwise it lands on the selected place's stop.

### The mode changes before the scroll

Where: `src/story/transitions.ts` `enterStory`

`enterStory` sets the mode first, so the class restores Story's layout at once and the scroll lands before the story driver's first announce. The driver then sees only the target stop, not the ones on the way.

### Text's stop is measured on leaving

Where: `src/story/transitions.ts` `enterExplore`, `enterStory`

Text has no story driver, so the store's `stop` is stale there. Leaving Text measures the section in view with `stopInView`.

### Scrolls use "instant", not "auto"

Where: `src/story/transitions.ts` `scrollToStop`, `land`

The page sets a smooth `scroll-behavior`, which turns `behavior: "auto"` into a fly-past. Jumps pass `"instant"`.

### The WebGL2 probe releases its context

Where: `src/boot/detect.ts` `hasWebgl2`

The town requires WebGL2 because three r163 and later have no WebGL1 path, so the check asks for a webgl2 context only. The probe context is lost immediately after the check so it does not count against the browser's limit on live contexts before the town's own canvas is created.

### The story driver starts after the first frame

Where: `src/client/client.ts` `startClient`

startStoryDriver is delayed until after the first frame and a task. The browser's own scroll to a #section in the URL must land first, because the driver's first announce calls replaceState, which would otherwise cancel that scroll. The entry runs before first paint, so without the delay it would announce too early.

### The town mounts before the mode switch

Where: `src/client/client.ts` `startClient`

The town's React root is created before the mode switch's slot, so in Explore the switch is the last tab stop after the HUD.

### Slow connections keep Story on the still image

Where: `src/client/town.ts` `slowNetwork`, `startTown`

On 2G or 3G, as reported by the Network Information API (Chromium only), Story does not load the town because it is a few hundred KB and a busy GPU. The town then loads only when the visitor picks Explore.

### Prerender fails on any render error

Where: `src/entry-server.tsx` `render`

The prerender collects errors through onError and throws after rendering. An error caught by a boundary would otherwise ship its fallback silently in the static HTML.

### The page is prerendered once at build time

Where: `scripts/prerender.mjs`

The site is one page, identical for every visitor, so it is rendered once at build time into dist/index.html. Without it the HTML is an empty root and crawlers that do not run JavaScript (link previews, most AI crawlers, search engines on a first pass) see no content.

### The page's stylesheet is inlined into the HTML

Where: `scripts/prerender.mjs` `STYLESHEET`

The page's one stylesheet (about 8 KB compressed) is inlined into the HTML because as a file it is a round trip that first paint waits on, which on slow 4G is most of a second's budget.

### The head preloads the poster image

Where: `vite.config.ts` `posterPreload`

An inline script after the head script preloads the AVIF still image Story shows until the canvas is ready: night or day, wide or tall, skipped in Text. Its media query must match the one story.css uses to pick the image, and a browser without AVIF skips the preload.

### detect-gpu's benchmark tables are self-hosted

Where: `vite.config.ts` `detectGpuBenchmarks`; `src/boot/detect.ts` `readSignals`

detect-gpu is imported dynamically, so it stays out of the first paint's bundle, and it would fetch its benchmark tables from unpkg. The site serves them itself under /benchmarks (from node_modules in dev, as emitted assets in the client build), so tier detection depends on no third-party host; the SSR build does not need them.

### The story's two fonts are preloaded

Where: `vite.config.ts` `preloadFonts`

The two variable fonts the first paint uses are preloaded from the HTML so they are in flight from the first byte. Without it the text paints in the fallback face and jumps when the font arrives, a layout shift. The HUD's label face is preloaded separately and only for Explore.

### The town's chunks are preloaded only for Explore

Where: `vite.config.ts` `preloadTown`

An inline script after the head script preloads the town's chunks and the HUD font when the head script chose Explore, so they do not wait for React to render. Story loads them when idle and a preload would compete with the still image and fonts on a slow connection, Text never fetches them, and the effects chunk is left to Town because only it knows the tier.

### The town preload script sits right after the head script

Where: `vite.config.ts` `preloadTown`

The preload script is inserted straight after the head script, which sets the mode class it reads. A script placed after the stylesheet would wait for the stylesheet to load before running.
