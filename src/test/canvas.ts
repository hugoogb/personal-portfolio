import { vi } from "vitest";

/**
 * jsdom has no 2D canvas. The kit draws textures (signs, stripes, grass) with
 * one, so tests give it a context whose every method is a no-op.
 */
export const stubCanvas = () => {
  const ctx = new Proxy(
    {},
    {
      get: (_target, key) => {
        if (key === "measureText") return () => ({ width: 10 });
        if (key === "createRadialGradient" || key === "createLinearGradient") {
          return () => ({ addColorStop() {} });
        }
        return () => {};
      },
      set: () => true,
    },
  );
  return vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockImplementation((() => ctx) as never);
};
