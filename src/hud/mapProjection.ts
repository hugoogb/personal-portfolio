/** Side of the minimap's square viewBox; fits the island turned 45 degrees. */
export const MINIMAP_SIZE = 46;

const ANGLE = Math.PI / 4;
const COS = Math.cos(ANGLE);
const SIN = Math.sin(ANGLE);

/**
 * Ground to minimap. The camera looks from +x+z, so the map turns 45 degrees
 * to put the screen's "up" (toward -x-z) at the top, like the view itself.
 */
export const toMap = (x: number, z: number) => ({ x: x * COS - z * SIN, y: x * SIN + z * COS });

export const fromMap = (mx: number, my: number) => ({
  x: mx * COS + my * SIN,
  z: -mx * SIN + my * COS,
});

/** A click inside the minimap's box, in map units centred on 0. */
export const clientToMap = (
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
) => ({
  x: ((clientX - rect.left) / rect.width - 0.5) * MINIMAP_SIZE,
  y: ((clientY - rect.top) / rect.height - 0.5) * MINIMAP_SIZE,
});
