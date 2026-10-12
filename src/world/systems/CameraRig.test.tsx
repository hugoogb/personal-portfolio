// @vitest-environment jsdom
import { act, render } from "@testing-library/react";
import * as THREE from "three";
import { afterEach, describe, expect, it, vi } from "vitest";
import { STOPS, cameraOffset, poseFor } from "@/content/tour";
import { resetMotionForTests } from "@/utils/motion";
import { useBaseCamp } from "@/store/store";
import { progress } from "@/story/progress";
import { CAMERA_OFFSET, clampTarget, rigState } from "@/world/lib/camera";
import { CameraRig } from "@/world/systems/CameraRig";

let frame: (s: unknown, dt: number) => void = () => undefined;
const camera = new THREE.OrthographicCamera();
const three = {
  camera,
  size: { width: 1280, height: 800 },
  gl: { domElement: document.createElement("canvas") },
};
vi.mock("@react-three/fiber", () => ({
  useFrame: (cb: (s: unknown, dt: number) => void) => {
    frame = cb;
  },
  useThree: (sel: (t: typeof three) => unknown) => sel(three),
}));

const ASPECT = three.size.width / three.size.height;

/** Advances the rig `n` frames of 1/30 s. */
const step = async (n: number) => {
  for (let i = 0; i < n; i++) act(() => frame({}, 1 / 30));
};
const renderRigAndStep = async (n: number) => {
  render(<CameraRig />);
  await step(n);
  return {
    canvas: three.gl.domElement,
    target: rigState,
    get zoom() {
      return camera.zoom;
    },
    offset: () => [
      camera.position.x - rigState.x,
      camera.position.y,
      camera.position.z - rigState.z,
    ],
  };
};
const dispatchWheel = (el: HTMLElement, deltaY: number) =>
  el.dispatchEvent(new WheelEvent("wheel", { deltaY, cancelable: true }));
const mockReducedMotion = (matches: boolean) =>
  vi.stubGlobal("matchMedia", () => ({
    matches,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));

afterEach(() => {
  Object.assign(progress, { index: 0, fraction: 0, cut: 0 });
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

describe("CameraRig in Story", () => {
  it("follows the story's pose and ignores the wheel in Story", async () => {
    useBaseCamp.setState({ mode: "story", introRunning: false });
    progress.index = 3;
    progress.fraction = 0;
    const cam = await renderRigAndStep(60);
    const pose = poseFor(STOPS[3], false, ASPECT);
    expect(cam.target.x).toBeCloseTo(pose.x, 1);
    expect(cam.target.z).toBeCloseTo(pose.z, 1);
    const before = cam.zoom;
    dispatchWheel(cam.canvas, 400);
    await step(10);
    expect(cam.zoom).toBeCloseTo(before);
  });

  it("ignores a selection change in Story", async () => {
    useBaseCamp.setState({ mode: "story", introRunning: false });
    progress.index = 3;
    const cam = await renderRigAndStep(60);
    act(() => useBaseCamp.getState().select("av"));
    await step(10);
    expect(cam.target.x).toBeCloseTo(poseFor(STOPS[3], false, ASPECT).x, 1);
  });

  it("eases the azimuth back to the fixed isometric angle in Explore", async () => {
    useBaseCamp.setState({ mode: "story" });
    progress.index = 6;
    progress.fraction = 0; // av, az 14
    const cam = await renderRigAndStep(60);
    expect(rigState.az).toBeGreaterThan(10);
    act(() => useBaseCamp.setState({ mode: "explore", selected: "av" }));
    await step(120);
    const o = cam.offset();
    cameraOffset(0).forEach((v, i) => expect(o[i]).toBeCloseTo(v, 1));
  });

  it("cuts to the stop under reduced motion", async () => {
    mockReducedMotion(true);
    useBaseCamp.setState({ mode: "story" });
    progress.index = 2;
    progress.fraction = 0.6;
    const cam = await renderRigAndStep(1);
    const pose = poseFor(STOPS[3], false, ASPECT); // currentStop rounds 2.6 to 3
    expect(cam.target.x).toBeCloseTo(pose.x, 3);
  });

  it("starts a return visit from the overview, so the camera eases in", async () => {
    useBaseCamp.setState({ mode: "story", firstVisit: false });
    await renderRigAndStep(1);
    const over = STOPS[STOPS.length - 1].pose;
    expect(rigState.view).toBeGreaterThan(over.view * 0.8);
  });
});
