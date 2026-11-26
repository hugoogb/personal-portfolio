# 0009: HUD and client UI

### Modifier chords are ignored while driving

Where: `src/world/systems/ArenaDrive.tsx` `onKeyDown`

On macOS a Cmd or Ctrl chord swallows the keyup, which would leave the key stuck held, so key presses with those modifiers are ignored in drive mode.

### The default accent keeps the designed favicon

Where: `src/client/accentFavicon.ts` `paint`

A generated favicon is drawn only when the visitor has picked a non-default accent. The default accent leaves the designed icon alone, because it is better than a generated one and the generated icon is meant as a reward for touching the picker.

### Shipped favicons are disabled, not removed

Where: `src/client/accentFavicon.ts` `paint`

The shipped icon links are disabled instead of deleted when an accent favicon is drawn. Switching back to the default accent then only has to re-enable them.

### The HUD sits over the canvas and lets clicks through

Where: `src/hud/Hud.tsx` `Hud`; `#town-root`

The canvas lives in #town-root beneath the HUD's stage, and the stage passes clicks through everywhere except its own pieces. The HUD mounts only in Explore.

### Explore's address follows the selection with replaceState

Where: `src/hud/Hud.tsx` `Hud`

The HUD writes the selected place into the URL hash with history.replaceState. replaceState fires no hashchange, so the hash routes do not react and no selection loop starts.

### The GPU name is read from the plain parameter first

Where: `src/hud/actions.ts` `gpuRenderer`

The renderer name is read from the plain RENDERER parameter first because the debug extension raises a deprecation warning in Firefox. Browsers that mask it as a generic WebKit WebGL still name the GPU through WEBGL_debug_renderer_info.

### Console commands depend on the site and the device

Where: `src/hud/commands.ts` `commandsFor`, `isPreview`

The night and day commands exist to check the lighting and are offered only off the live site. The drive command needs a keyboard, so touch-only devices are not offered it.

### Shortcuts stand down in form fields but Escape always works

Where: `src/hud/keys.ts` `keyAction`

Shortcuts never fire from form fields, so typing is not hijacked. Escape and the console shortcut are the exceptions so a dialog can always be closed.

### The minimap is turned 45 degrees to match the camera

Where: `src/hud/mapProjection.ts` ground-to-map projection

The camera looks from +x+z, so the map is rotated 45 degrees to put the screen's up, toward -x-z, at the top. The minimap then matches the view and a click maps back to the same ground point.

### Dialogs leave Esc to useHudKeys

Where: `src/hud/useDialog.ts` `useDialog`; `src/hud/useHudKeys.ts`

A mounted dialog moves focus to its `[data-autofocus]` control or its first one, traps Tab and restores focus on unmount, but does not handle Esc. Esc belongs to useHudKeys, which closes the innermost open thing first.

### The dialog focus trap mirrors the browser's tab order

Where: `src/hud/useDialog.ts` `useDialog` `items`

The focus trap lists only controls that are laid out, and counts a radio group as one stop, its checked radio. Otherwise Tab could leave the dialog from its real last stop without the trap noticing.

### Touch-only devices are not offered driving

Where: `src/utils/input.ts` `isTouchOnly`

A device where nothing can hover or point finely, such as a phone or a tablet without a trackpad, is treated as having no keyboard. Driving needs keys for reverse and boost, so it is not offered there. A touch laptop keeps its trackpad and is not touch-only.
