# 0006: Town content

### The town has few trees

Where: `src/world/town/town.ts` `buildTown` tree loop, `SEAFRONT`, `SEAFRONT_TREES`

The town grows 32 trees; 60, then 45, read as too busy (2026-10-10). The seafront lawn between the arena and the restaurant gets at most three, a few trees rather than a wood.

### Traffic is drawn as flow lines

Where: `src/world/traffic/build.ts` `buildTraffic`

Traffic is drawn as flow lines rather than packets, with no difference between requests and responses, so both directions draw the same accent streak (2026-10-10).

### The sea receives no shadows

Where: `src/world/town/town.ts` water mesh

The sea stays clean: cloud shadows fall on the island only.

### Beach props sit on the ground group

Where: `src/world/town/town.ts` umbrellas and towels

The umbrellas and towels are added to the ground group, not the root, so they rise with the island during the build-in.

### The night owl uses the real clock

Where: `src/world/systems/DayNight.tsx` night achievement

The night owl achievement counts the real Barcelona clock, not the preview hour override.

### The harbour and hat sit in an unrotated child group

Where: `src/world/places/departures.ts` `buildDepartures`

The harbour and the straw hat are authored in world coordinates, so they go in a child group that undoes the departures board's rotation and offset. This keeps them at fixed world positions however the board is placed.

### F1 and yard bounding boxes overlap by design

Where: `src/world/build.test.ts` `ALLOWED`

The F1 circuit and the yard sit at the approved sketch's coordinates, so their axis-aligned boxes overlap by about 0.9 at the circuit's edge while the geometry does not touch. The overlap test allowlists that one pair.

### Reduced motion stills only what the town does on its own

Where: `src/world/lib/ambient.ts` `trafficCaps`

Under reduced motion nothing decorative moves on its own, traffic included. Motion the visitor starts (driving, the wave, the caravel, the lap flash) still plays, because they asked for it.

### The hat's hit target is placed after the build-in

Where: `src/world/systems/Eggs.tsx` hat hit target

The hat never moves once the town settles, so its click target is positioned once, after the build-in has finished scaling the world. Until then the target sits at the origin and is not clickable.

### Reduced motion still follows the time of day

Where: `src/world/systems/Life.tsx` `Life`

Under reduced motion the sea, cloud shadows and smoke still follow the time of day, because that is lighting rather than motion.

### The still town is posed once at its current time

Where: `src/world/systems/Life.tsx` `posed`

When motion is reduced, the town is posed once per stillness at the time it had reached. Cars and the press line sit at the origin until a frame runs, so a mid-visit switch to reduced motion must not snap them to t = 0.

### Traffic numbers are simulated

Where: `src/world/traffic/model.ts` traffic profiles

The traffic rates per app are a fixed, plausible profile that only shapes the animation; none of the numbers is ever shown on screen, so they never pass for real metrics.
