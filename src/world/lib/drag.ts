export const drag = { distance: 0 };

export const DRAG_THRESHOLD_PX = 6;

export const wasDrag = () => drag.distance > DRAG_THRESHOLD_PX;
