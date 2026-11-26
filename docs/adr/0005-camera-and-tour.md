# 0005: Camera and tour

### The camera sits far from its target

Where: `src/world/lib/camera.ts` `CAMERA_OFFSET`

The view is orthographic, so the distance does not change the picture. It is kept large so that, zoomed out, the bottom of the screen never starts below the sea, where the near plane would cut it off as a pale band.

### In Story the scroll drives the camera

Where: `src/world/systems/CameraRig.tsx` `CameraRig`

In Story the goal each frame is the tour's pose for the scroll position, so a selection or a reframe does not move the camera. Story poses are not clamped to the pan limit, because a pose framing a building by the shore sits past it on purpose; back in Explore the goal is clamped again and the azimuth eases back to 0. A return visit has no build-in, so it starts at the wide overview pose and eases in.

### Panning moves the camera and its goal together

Where: `src/world/systems/CameraRig.tsx` `onMove`

A drag shifts the camera position and its goal by the same amount, so the ground stays under the pointer instead of easing after it.

### Wheel deltas are converted to pixels

Where: `src/world/systems/CameraRig.tsx` `onWheel`

`wheelZoom` expects pixels, but Firefox reports lines (`deltaMode` 1) or pages (2) on some devices, so those are converted first.

### The minimap view is published only on change

Where: `src/world/systems/CameraRig.tsx` publish step

The rig publishes its view ten times a second, and only when it changed, because each publish re-renders the minimap.

### Tour stops follow the story document

Where: `src/content/tour.ts` `STOPS`, `Pose`

`STOPS` is in the story document's order, and the story driver maps sections to stops by index. Poses are tuned by eye: `view` is the view height in world units and `az` is the azimuth in degrees. The overview is lifted so the island clears the closing line and button below it.

### A phone's framing follows the card sheet

Where: `src/content/tour.ts` `NARROW_LIFT`; `src/story/story.css`

On a phone the card sheet starts at 56% of the screen (story.css), so the building is lifted 0.22 of the view to centre in the top 56%. Change the two together.

### Pointer travel gates clicks

Where: `src/world/lib/drag.ts` `drag`

The camera rig records how far the pointer moved since the press, and picking reads it, so a pan that ends over a building never counts as a click.

### A tall section's stop is reached at its top

Where: `src/story/progress.ts` `measureStops`

A section no taller than the screen is reached when centred. A taller one, such as a phone card sheet, is reached when its top meets the top of the screen, so the building is in view first and the card is read while the camera holds. Anchor jumps land on the same line.

### Hidden sections are skipped when finding the current stop

Where: `src/story/progress.ts` `currentStop`

Sections the layout hides, such as the finale in Text, are skipped because a hidden box measures at the top of the page and would win the lookup.
