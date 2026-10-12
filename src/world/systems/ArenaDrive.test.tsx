// @vitest-environment jsdom
import { act, render } from "@testing-library/react";
import * as THREE from "three";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useBaseCamp } from "@/store/store";
import type { BuiltWorld } from "@/world/build";
import { ArenaDrive } from "@/world/systems/ArenaDrive";

const frames: ((s: unknown, dt: number) => void)[] = [];
vi.mock("@react-three/fiber", () => ({
  useThree: () => ({
    gl: { domElement: document.createElement("canvas") },
    camera: new THREE.PerspectiveCamera(),
    raycaster: new THREE.Raycaster(),
  }),
  useFrame: (cb: (s: unknown, dt: number) => void) => {
    frames.length = 0;
    frames.push(cb);
  },
}));

const fakeWorld = () => {
  const g = new THREE.Group();
  const car = new THREE.Group();
  g.add(car);
  const parts = { g, car, ball: new THREE.Group(), flame: new THREE.Group() };
  return { world: { kit: { life: { arena: parts } } } as unknown as BuiltWorld, car };
};
const tick = () => act(() => frames[0]({}, 0.05));

afterEach(() => useBaseCamp.setState({ driving: false }));

describe("ArenaDrive", () => {
  it("drives with a plain key but ignores a Cmd or Ctrl chord (no keyup arrives for it)", () => {
    useBaseCamp.setState({ driving: true });
    const { world, car } = fakeWorld();
    render(<ArenaDrive world={world} />);
    act(() => void window.dispatchEvent(new KeyboardEvent("keydown", { key: "w", metaKey: true })));
    tick();
    const start = car.position.clone();
    for (let i = 0; i < 5; i++) tick();
    expect(car.position.equals(start)).toBe(true);
    act(() => void window.dispatchEvent(new KeyboardEvent("keydown", { key: "w" })));
    for (let i = 0; i < 5; i++) tick();
    expect(car.position.equals(start)).toBe(false);
  });

  it("ends drive mode when the world unmounts mid-drive", () => {
    useBaseCamp.setState({ driving: true });
    const { world } = fakeWorld();
    const { unmount } = render(<ArenaDrive world={world} />);
    expect(useBaseCamp.getState().driving).toBe(true);
    unmount();
    expect(useBaseCamp.getState().driving).toBe(false);
  });
});
