// @vitest-environment jsdom
import { act, fireEvent, render } from "@testing-library/react";
import * as THREE from "three";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useBaseCamp } from "@/store/store";
import type { BuiltWorld } from "@/world/build";
import { Eggs } from "@/world/systems/Eggs";

let frame: (s: unknown, dt: number) => void = () => undefined;
vi.mock("@react-three/fiber", () => ({
  useFrame: (cb: (s: unknown, dt: number) => void) => {
    frame = cb;
  },
}));

afterEach(() => useBaseCamp.setState(useBaseCamp.getInitialState()));

describe("Eggs hat target", () => {
  it("ignores clicks until it has been placed on the hat", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    useBaseCamp.setState({ introDone: false });
    const ship = { g: new THREE.Object3D(), home: new THREE.Vector3(), sail: -1 };
    const world = {
      kit: { mat: () => new THREE.MeshBasicMaterial(), life: { hat: new THREE.Group(), ship } },
    } as unknown as BuiltWorld;
    const { container } = render(<Eggs world={world} />);
    const hit = container.querySelector("mesh")!;
    (hit as unknown as { position: THREE.Vector3 }).position = new THREE.Vector3();
    fireEvent.click(hit);
    expect(useBaseCamp.getState().achievements).not.toContain("hat");
    expect(ship.sail).toBe(-1);
    act(() => frame({}, 0.016));
    fireEvent.click(hit);
    expect(useBaseCamp.getState().achievements).not.toContain("hat");
    useBaseCamp.setState({ introDone: true });
    act(() => frame({}, 0.016));
    fireEvent.click(hit);
    expect(useBaseCamp.getState().achievements).toContain("hat");
    expect(ship.sail).toBe(0);
  });
});
