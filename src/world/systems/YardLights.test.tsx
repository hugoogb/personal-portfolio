// @vitest-environment jsdom
import { render } from "@testing-library/react";
import * as THREE from "three";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useBaseCamp } from "@/store/store";
import { resetMotionForTests } from "@/utils/motion";
import type { BuiltWorld } from "@/world/build";
import { YardLights } from "@/world/systems/YardLights";

let frame: (s: unknown, dt: number) => void = () => undefined;
vi.mock("@react-three/fiber", () => ({
  useFrame: (cb: (s: unknown, dt: number) => void) => {
    frame = cb;
  },
}));

const reduce = (on: boolean) =>
  vi.stubGlobal("matchMedia", () => ({
    matches: on,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));

const setup = () => {
  const leds = new THREE.InstancedMesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial(), 10);
  leds.setColorAt(0, new THREE.Color());
  const original = leds.setColorAt.bind(leds);
  const spy = vi.fn((i: number, c: THREE.Color) => original(i, c));
  leds.setColorAt = spy;
  render(<YardLights world={{ kit: { life: { leds } } } as unknown as BuiltWorld} />);
  return { spy };
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  resetMotionForTests();
  useBaseCamp.setState({ status: "unknown" });
});

describe("YardLights", () => {
  it("still: paints every LED once per status change, with no serialising per frame", () => {
    reduce(true);
    const { spy } = setup();
    frame({}, 0.016);
    expect(spy).toHaveBeenCalledTimes(10);
    const stringify = vi.spyOn(JSON, "stringify");
    frame({}, 0.016);
    frame({}, 0.016);
    expect(stringify).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(10);
    useBaseCamp.setState({ status: { rl: { ok: false, ms: null }, es: { ok: true, ms: 5 } } });
    stringify.mockClear();
    frame({}, 0.016);
    expect(spy).toHaveBeenCalledTimes(20);
    expect(stringify).not.toHaveBeenCalled();
  });

  it("moving: blinks a few LEDs per tick, not per frame", () => {
    reduce(false);
    const { spy } = setup();
    frame({}, 0.05);
    expect(spy).not.toHaveBeenCalled();
    frame({}, 0.1);
    expect(spy).toHaveBeenCalledTimes(8);
  });
});
