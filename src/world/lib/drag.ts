/**
 * Pointer travel since the last press. The camera rig writes it and picking
 * reads it, so a pan that ends over a building never counts as a click.
 */
export const drag = { distance: 0 };

export const DRAG_THRESHOLD_PX = 6;

export const wasDrag = () => drag.distance > DRAG_THRESHOLD_PX;
