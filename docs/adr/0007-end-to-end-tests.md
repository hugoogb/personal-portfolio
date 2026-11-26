# 0007: End-to-end tests

### The suite pins a manual quality

Where: `e2e/world.spec.ts` `LOW`

detect-gpu blocklists SwiftShader, so the suite seeds a manual quality mode; the town then loads on any WebGL context. These tests drive the HUD, so the seed also starts them in Explore.

### The saved record is seeded once per tab

Where: `e2e/world.spec.ts` `beforeEach`

The init script writes the `bc` record only once per tab (marked in sessionStorage), so a choice made during a test survives a reload.

### The Lite radio is clicked, not checked

Where: `e2e/world.spec.ts` "Lite keeps the story on the still image"

Picking Lite removes the radio itself, so `check()` cannot confirm its state afterwards.

### A caught effects failure shows as one pageerror

Where: `e2e/world.spec.ts` "a failed effects chunk leaves the town running"

The effects boundary catches the failed chunk, but R3F's `onCaughtError` reports caught errors through `reportError`, so exactly one `pageerror` shows.

### The draw-call budget alternates with the shadow pass

Where: `e2e/world.spec.ts` "on Medium, a running frame stays in the draw-call budget"

The shadow map is drawn every other frame (see 0004), so frames alternate between the main pass alone (at most 250 calls) and the main pass plus the shadow pass (at most 310, the 250 + 60 budget).

### Frames are counted by the hook, not by gl.info

Where: `src/world/systems/TestHooks.tsx` `frames`

gl.info.render.frame counts every render() call, which is several per frame under the composer, so the hook counts drawn frames itself.

### Axe waits for the town's fade-in to finish

Where: `e2e/a11y.spec.ts` `ready`

The town fades in over 0.6s and its labels live inside it, so the suite polls the backdrop's opacity to 1 before scanning. Axe reads a label caught mid-fade as faint text and reports a false contrast failure.

### Status-pill contrast is computed by hand

Where: `e2e/a11y.spec.ts` `pillContrast`

The pills sit on glass cards over the town, and axe cannot read through the glass to the canvas, so it would only report the check as incomplete. The test blends the card's glass over the backdrop's own colour and computes the WCAG ratio itself.

### The finale is scanned a second time in view

Where: `e2e/a11y.spec.ts` "has no serious violations by ..."

The finale text sits on the town, which axe cannot read while it is off screen. The suite scrolls it into view and scans again, excluding the top section instead.

### A rail dot's hit area is probed 11px off-centre

Where: `e2e/a11y.spec.ts` "a rail dot is a 24px target"

A rail dot's pseudo-element is part of its link's hit area, so the 24px target is checked by probing points 11px from the centre, just inside the target's edge.

### A rail dot's shared edge may belong to a neighbour

Where: `e2e/a11y.spec.ts` "a rail dot is a 24px target"

Adjacent dots overlap on a shared edge, so only the sides with no neighbour (the first dot's top, the last dot's bottom) must hit their own dot. The test tolerates the shared edges to avoid failing on a neighbour that legitimately owns them.

### The reduced-motion test pins only the azimuth

Where: `e2e/a11y.spec.ts` "the camera cuts to each stop's pose, with nothing in between"

The test asserts each stop's azimuth from `src/content/tour.ts` and leaves x, z and view to wherever the camera settles. It then checks that no sample lies between the old and final poses.

### The reduced-motion test waits for the first save

Where: `e2e/modes.spec.ts` "reduced motion starts in Text without saving Text"

The status poll writes the saved record on boot, so the test waits for the record to exist before asserting that Text was not saved as a choice. Asserting earlier would pass trivially on an empty record.

### LCP readings fall back to the parent of a text node

Where: `e2e/pageMetrics.ts` `pageMetrics`

A text node has no element of its own, so the largest-contentful-paint tag is its parent element's; an image LCP is recognised by its non-empty url.

### The phone test asserts only first paint

Where: `e2e/phone.spec.ts`

The phone test asserts that the story's text paints within 1 s on throttled slow 4G, before any 3D. The town-ready time is not asserted here because SwiftShader has no GPU, so GPU timings are checked on real devices.

### Speed Insights load failures are ignored

Where: `e2e/text.spec.ts` `isNoise`

Vercel's Speed Insights script exists only on Vercel, so under `vite preview` it 404s and logs a console error. Chromium's failed-load message omits the URL, so the console check filters on the message's source location containing `/_vercel/`.

### Link tests start from a fresh load

Where: `e2e/text.spec.ts` "links into the site still land"

Each hash link is loaded from `about:blank` because a same-page hash change issued during a smooth scroll is a different case, and headless Chromium drops it.

### Timing tests run alone in their own project

Where: `playwright.config.ts` `projects`

The phone project runs first and the main project depends on it, so the throttled timing assertion runs without parallel workers competing for CPU and slowing the page.

### Chromium launches with SwiftShader

Where: `playwright.config.ts` `projects`

Headless Chromium has no GPU, so it launches with SwiftShader flags to give the town a WebGL context.
