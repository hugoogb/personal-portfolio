# 0002: State and persistence

### The store core has no React

Where: `src/store/core.ts` `createBaseCampCore`, `src/store/store.ts`

The client entry that runs at first paint has no React, and it reads and writes the vanilla zustand store directly. `store.ts` binds the React hook on top, so `core.ts` must not import React.

### The saved record is validated field by field

Where: `src/store/core.ts` `restore` and the `persist` options

The saved `bc` record comes from the visitor's browser, so it may be an older shape, a hand-edited value or another version. `restore` keeps each field only when it is valid, so one bad field falls back to its default instead of breaking the HUD. Every version goes through `restore`, so `migrate` passes the record through instead of migrating it.

### The accent keeps its own `color` key

Where: `src/store/core.ts` `STORE_KEY`, `src/store/accent.ts`, `src/boot/head.ts` `bootHead`

Everything persisted lives in the one `bc` record except the accent colour, which stays under its older `color` key. The head script reads both keys before first paint.

### Only the visitor's own choice of mode is saved

Where: `src/store/core.ts` `mode`, `chosenMode`, `setMode`, `chooseMode`, `merge`; `src/story/transitions.ts` `How`

`mode` is what is on screen: the head script's pick, then hashes, fallbacks and choices, and it is never saved. `chosenMode` is the only saved mode, and only an explicit pick sets it: the switch, the finale, Esc, the console or HQ's "About me". A hash or a fallback changes the mode with `chosen: false`, and on rehydration `merge` keeps `current.mode` (read from the class the head script set) and restores only the choice.

### Repeat requests carry a sequence number

Where: `src/store/core.ts` `CameraGoal.seq`, `arrival.seq`, `reframeSeq`

Camera goals, tour arrivals and reframes carry a counter, so asking for the same thing twice is a new value that subscribers react to instead of an equal one they skip.

### Drive mode ends with the world

Where: `src/world/systems/ArenaDrive.tsx` unmount cleanup

The world can unmount mid-drive (switching Settings to Lite), so unmounting the drive system always clears the driving flag.

### A dropped world releases the camera

Where: `src/world/systems/BuildIn.tsx` effect cleanup

If a world is dropped while the build-in runs, the cleanup clears the intro-running flag, so the camera is not left held for the next world.

### Traffic catches up on store changes after subscribing

Where: `src/world/systems/Traffic.tsx` effect

The sim is built before the store subscription starts, so the effect applies the current plans on mount to catch any change in between.

### Storage failures mean nothing is saved

Where: `src/store/storage.ts` `createSafeStorage`

localStorage may be missing during server render or throw on every call in private windows or with blocked site data. Every read and write is guarded and falls back to nothing saved, so the town keeps working.
