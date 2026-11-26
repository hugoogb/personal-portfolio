# 0004: Rendering performance

### How the starting tier is chosen

Where: `src/boot/tiers.ts` `chooseTier`

Lite (no 3D) is chosen for no WebGL, reduced motion, Save-Data, or a GPU detect-gpu rates unusable. Touch devices start at Medium at most, because their GPUs share power and heat with everything else on the phone. High's ambient occlusion is a full-screen pass every frame, so only a GPU rated top tier starts there, and an unknown GPU starts at Medium, which every tier-2 GPU holds at 60 fps.

### Pixel-ratio caps and frame rates

Where: `src/boot/tiers.ts` `MAX_DPR`, `TARGET_FPS`, `IDLE_FPS`

High caps the pixel ratio at 1.25 because its AO costs per pixel: at 2 the effects alone took 28 ms a frame on an M4, and at 1.5 the night town still missed frames. Medium and High draw at 60 fps even on a 120 Hz display, Low at 30, and an idle or backgrounded town drops to 30.

### The governor only steps down

Where: `src/boot/tiers.ts` `governorTick`, `nextStep`, `GOVERNOR`

After two slow one-second windows in a row, the governor gives up the cheapest thing first: High's effects, then Medium's pixel ratio a quarter step at a time, then at a ratio of 1 its shadows and half its frames (Low). It never acts during the grace period after load or a tier change (shader compilation), in manual mode or below Low, and it never steps back up. A frame longer than 0.25 s is a pause (a shader compile, a hidden tab), not slowness, and restarts the window it falls in.

### Shaders compile before the first frame

Where: `src/world/World.tsx` `Compile`, `compiled`

Nothing is drawn (the frameloop is "never" and the Pacer is unmounted) until `compileAsync` finishes, which runs off the main thread where `KHR_parallel_shader_compile` exists. three keys a program by where it draws: into a render target it outputs linear colour with no tone mapping, onto the canvas sRGB and tone-mapped. So when the composer draws, the compile runs with a render target bound, or the first frame compiles the real programs on the main thread; `compileAsync` picks every program synchronously, so the previous target is restored right after the call.

### The canvas context is fixed at creation

Where: `src/world/World.tsx` `composed`; `src/world/effects/Effects.tsx`

A town that starts on High draws through the composer, which antialiases with FXAA, so its canvas has no MSAA: N8AO over a multisampled target costs several times the scene itself. When that town steps down to Medium the composer stays, without AO and bloom, because taking it away would recompile every shader in the scene at once. Effects is its own chunk, so other tiers never download it.

### Shadows are PCF by name

Where: `src/world/World.tsx` `shadows` prop

R3F's bare `shadows` asks for PCFSoft, which three r186 swaps for PCF on the first shadow pass, so every lit program compiled before it would compile again. The Canvas asks for `"percentage"` directly.

### The shadow map is drawn every other frame

Where: `src/world/systems/DayNight.tsx` `SHADOW_EVERY`

Left on `autoUpdate`, three redraws the shadow map for every `render()` call, which the composer can make more than one a frame. DayNight turns it off and requests an update every second frame; at 60 fps a moving car's shadow trails it by one frame at most, a pixel or two at the town's zoom. A new light (keyed by its map size) requests its map in a layout effect, so it is drawn on the very next frame.

### The scene root never recomposes its matrix

Where: `src/world/World.tsx` `onCreated`

The scene itself never moves. With `matrixAutoUpdate` on, it recomposes its matrix every frame, which makes three recompute every world matrix in the town, static or not.

### Shader error checks run only in previews

Where: `src/world/World.tsx` `onCreated`

three reads every program's compile log synchronously on first use, a stall per shader on a phone. `checkShaderErrors` is on only in previews (and so in e2e), so a broken shader still shows there.

### Point lights exist only while they shine

Where: `src/world/systems/DayNight.tsx` `floodlightsOn`

Every lit pixel pays for each point light in the scene, dark or not, and by day the stadium lights were a fifth of the frame, so they are invisible outside their hours. Toggling them recompiles the lit shaders twice a day (one short hitch at dusk). Their first state is set in a layout effect, so the first frame's shaders already match the hour. By day the light pools are clear, so they are made invisible and skip their draws.

### Static meshes are baked to fit the draw-call budget

Where: `src/world/build.ts` `buildSteps`; `src/world/kit/bake.ts` `bakeStatic`

Static meshes are merged per material, and plain opaque materials (no map, no emissive) are merged by roughness and metalness into one vertex-coloured material. Subtrees marked `userData.dynamic` (roads, animated parts, smoke) and every material repainted or lit at runtime (the `keep` set) stay separate. Rigid moving groups (cars, ship, buoys, hat, lid) are baked inside themselves and keep their own shadow, since the group moves but its pieces do not.

### Baking copies geometry instead of cloning it

Where: `src/world/kit/bake.ts` `bakeStatic`

`geometry.clone()` runs the subclass constructor first, building a default sphere or rounded box only for `copy()` to overwrite it, and that was a third of the town's build. Bake uses `new BufferGeometry().copy()`.

### One shadow proxy per baked root

Where: `src/world/kit/bake.ts` `shadowProxy`, `coarse`, `shadowGeometry`

With `shadowProxy`, every caster's geometry is drawn as one invisible mesh that casts the shadow, and the coloured merged meshes stop casting, so the shadow pass costs one draw per root instead of one per bucket. The proxy's geometry is coarse (plain boxes for rounded ones, 6-sided curved solids, positions only) and leaves out specks under `TINY`.

### The town builds in time slices

Where: `src/world/build.ts` `buildWorldInSlices`, `nextTask`

Built at once, the town was one task of over 100 ms on a laptop and nearly half a second on a phone, so it yields about every 12 ms to keep the page scrolling and clickable. It yields with `scheduler.yield()` where it exists, which resumes ahead of other queued work, else a MessageChannel task. `setTimeout(0)` is avoided because from the fifth nested call browsers wait at least 4 ms each time.

### AO treats the scene as opaque

Where: `src/world/effects/Effects.tsx` `opaqueAO`

N8AO checks every frame for transparent materials and, finding the town's glass, smoke and light pools, draws the scene twice more into two full-size targets to keep AO off them. That was an eighth of High's frame for a difference that does not show over this town, so transparency detection and awareness are both off. The sample counts barely move the cost; the low ones keep the noise soft at this zoom.

### Effect passes are not merged

Where: `src/world/effects/Effects.tsx` `EffectComposer`

FXAA reads its input texture directly at edges, so merged into the tone-mapping pass it would return untone-mapped HDR there; the composer runs with `mergeMode="none"` and FXAA last, on its own pass. The composer turns the renderer's tone mapping off, so `ToneMapping` restores the Canvas's ACES, after bloom has seen the HDR values.

### Tree geometry is cut to the triangle budget

Where: `src/world/town/town.ts` `sphG`, `coneG`

The trees' sphere and cone segment counts are reduced from the original sketch (14, 10) to fit the triangle budget.

### Cloud shadows are a shadow-only mesh

Where: `src/world/town/town.ts` `cloudShadow`

Cloud shadows are one invisible instanced mesh (no colour or depth writes) that only the sun's shadow map draws. It stays on layer 0 because three's shadow pass tests objects against the main camera's layers. It is hidden at night, and an invisible mesh is not drawn into the shadow map either.

### Traffic streak geometry and shader move together

Where: `src/world/traffic/build.ts` `flowG`, `flowM.onBeforeCompile`

The streak geometry is translated to run from x = -1 (its tail) to x = 0 (its head), and the vertex shader maps that range through the per-instance `flowRange`. A streak bent round a corner is several pieces, each carrying its slice of the tail-to-head fade, so the fade runs unbroken. Change the geometry's extent and the shader together.

### Tiny rounded boxes use one segment

Where: `src/world/kit/kit.ts` `rbox`

Rounded boxes with a corner radius of 0.04 or less get one segment instead of three, because trim, frames and sills have corners too small to see. This saves vertices across the many small boxes in the town.

### Rounded boxes stay indexed

Where: `src/world/kit/roundedBox.ts` `RoundedBoxGeometry`

Rounded boxes use a local indexed copy of three's RoundedBoxGeometry (same positions, normals and UVs). Three's version unrolls the box into separate triangles, so a 3-segment box carries 1,764 vertices instead of 384, all shaded every frame, and it cannot merge with the town's indexed boxes and spheres when baking.

### Ship lanterns use the shared lamp material

Where: `src/world/places/departures.ts` `buildDepartures`

The ship's stern and bow lanterns use the shared lamp material so they follow the lamps' day/night intensity, and a glow on the water keeps the dark hull readable against the dark sea at night.

### Overlapping faces are offset to avoid z-fighting

Where: `src/world/places/departures.ts` `buildDepartures`

The rowboat's deck sits above the hull's top face instead of sharing its plane, because coplanar faces z-fight. Keep a small offset whenever two meshes would share a surface.

### Stadium players do not cast shadows

Where: `src/world/places/stadium.ts` `buildStadium`

The tiny 11 cm player capsules do not cast shadows: their shadows are specks and each caster would cost a draw in the shadow pass.

### Tally glow constants are the rest value DayNight scales

Where: `src/world/places/tally.ts` `GLOW`

GLOW and SCREEN are the at-rest intensities of the tally counter's backlight and Wrap card. DayNight scales them down when the service is down, so changing them means checking DayNight.

### Place anchors compose their matrix once

Where: `src/world/scene/Places.tsx` `pin`

Each place's anchor group never moves, so its matrix is composed once and matrixAutoUpdate is turned off, saving per-frame matrix work for every place.

### Each place is picked through one invisible hit volume

Where: `src/world/scene/Places.tsx` `PlaceNode`

Each place has one generous invisible mesh carrying all pointer handlers (three.js raycasts invisible meshes). The place's own parts, such as the straw hat, caravel and buoys, carry no handlers so they are not picked as the place.

### Draw-call budget counts hidden smoke

Where: `src/world/budget.test.ts` `measure`

The render-budget test counts smoke meshes even though they start hidden, because in steady state the smoke is on screen and costs draw calls.

### Effects fail soft

Where: `src/world/effects/EffectsBoundary.tsx` `EffectsBoundary`

Effects are a finish, so if their chunk fails to load or the composer throws while mounting, the town renders without them. Draw-time GPU errors are not caught; the capability gate keeps the known one (no float render targets) from ever mounting the composer.

### Half-float support is probed on a throwaway context

Where: `src/world/effects/effectsGate.ts` `probeHalfFloat`

The town's canvas is created without MSAA only when the composer is sure to run on it, so half-float support is tested on a throwaway WebGL context before the real canvas exists.

### R3F gets a hand-kept THREE catalogue

Where: `src/world/lib/catalogue.ts` three catalogue

The canvas registers only the three.js classes the JSX names, because extend(THREE) would keep every class in the bundle. A tag missing from the list fails at runtime, so a class must be added when JSX first uses it.

### Static matrices are frozen once, after the build-in

Where: `src/world/lib/freeze.ts` `freezeStatic`

Everything under the town that never moves has its matrix composed once and then stops updating, while a userData.dynamic object and its descendants keep updating. It must run after the build-in settles, because the build-in scales and raises static parts.

### Unlit point lights skip their lighting maths

Where: `src/world/lib/pointLights.ts` `skipUnlitPointLights`

three lights every pixel with every point light even when the light's attenuation is zero there. The stadium's four short-range floodlights cost a quarter of Medium's frame at night, so the lights chunk is patched once, before any program compiles, to skip lights three marks not visible. The picture is unchanged, and a three version that reshapes the chunk is left unpatched.

### Arrival glow scales noted resting values

Where: `src/world/systems/Arrivals.tsx` `Arrivals`

DayNight rewrites resting light intensities only four times a second, so multiplying the live value would compound. The arrival pulse notes the resting values at its start and sets rest times k each frame, and it mounts after DayNight so its writes win.

### Build-in runs on wall-clock time

Where: `src/world/systems/BuildIn.tsx` `useFrame`

The build-in advances by wall-clock time, capped per frame only against a tab-switch jump, so a slow device skips frames rather than stretching the animation by seconds.

### Mode changes restart the governor's grace period

Where: `src/world/systems/Governor.tsx` `Governor`

A mode change can resize the canvas, so the governor restarts its grace period then, and the frame times from before the resize do not count as slowness.

### A step down never raises the pixel ratio

Where: `src/world/systems/Governor.tsx` `useFrame`

A tier step down never raises the pixel ratio, because High's cap (1.25) is below Medium's (1.5).

### The Pacer's first frame takes a one-frame delta

Where: `src/world/systems/Pacer.tsx` `fresh`

advance() takes its delta from the clock's last time. At start, and after a pause (which remounts the Pacer), the clock is set one frame back so nothing jumps by the time spent away.

### R3F's three import is redirected to a catalogue

Where: `vite.config.ts` `redirectToCatalogue`, `threeCatalogue`; `src/world/lib/catalogue.ts`

R3F's Canvas does `import * as THREE from "three"` for `extend(THREE)`, which keeps about 50 KB gzipped of unused classes in the bundle. That one import is redirected to `catalogue.ts`, which lists only the classes the JSX uses. Dev pre-bundling gets the same redirect so a missing tag fails in dev as in the build, and the build fails if R3F stops importing three that way.
