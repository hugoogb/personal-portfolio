// @vitest-environment jsdom
import { act, render } from "@testing-library/react";
import * as THREE from "three";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resetMotionForTests } from "@/utils/motion";
import { useBaseCamp } from "@/store/store";
import { CAMERA_OFFSET, clampTarget } from "@/world/lib/camera";
import { CameraRig } from "@/world/systems/CameraRig";

let frame: (s: unknown, dt: number) => void = () => undefined;
const camera = new THREE.OrthographicCamera();
const three = {
  camera,
  size: { width: 1280, height: 800 },
  gl: { domElement: document.createElement("canvas") },
  invalidate: () => undefined,
};
vi.mock("@react-three/fiber", () => ({
  useFrame: (cb: (s: unknown, dt: number) => void) => {
    frame = cb;
  },
  useThree: (sel: (t: typeof three) => unknown) => sel(three),
}));

afterEach(() => {
  resetMotionForTests();
  vi.unstubAllGlobals();
  useBaseCamp.setState(useBaseCamp.getInitialState());
});

describe("CameraRig reduced motion", () => {
  it("jumps to a goal once the preference flips mid-visit", () => {
    let reduced = false;
    let fire: () => void = () => undefined;
    vi.stubGlobal("matchMedia", () => ({
      get matches() {
        return reduced;
      },
      addEventListener: (_: string, f: () => void) => (fire = f),
      removeEventListener: () => undefined,
    }));
    render(<CameraRig />);
    act(() => frame({}, 0.016));
    const x0 = camera.position.x;
    act(() => useBaseCamp.getState().focus(10, 0, 20));
    act(() => frame({}, 0.016));
    expect(Math.abs(camera.position.x - x0)).toBeLessThan(5);
    reduced = true;
    fire();
    act(() => frame({}, 0.016));
    expect(camera.position.x).toBeCloseTo(clampTarget(10, 0).x + CAMERA_OFFSET[0], 6);
  });
});
