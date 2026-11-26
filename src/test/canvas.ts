import { vi } from "vitest";

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
