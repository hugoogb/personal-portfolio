export const MINIMAP_SIZE = 46;

const ANGLE = Math.PI / 4;
const COS = Math.cos(ANGLE);
const SIN = Math.sin(ANGLE);

export const toMap = (x: number, z: number) => ({ x: x * COS - z * SIN, y: x * SIN + z * COS });

export const fromMap = (mx: number, my: number) => ({
  x: mx * COS + my * SIN,
  z: -mx * SIN + my * COS,
});

export const clientToMap = (
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
) => ({
  x: ((clientX - rect.left) / rect.width - 0.5) * MINIMAP_SIZE,
  y: ((clientY - rect.top) / rect.height - 0.5) * MINIMAP_SIZE,
});
