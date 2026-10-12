import { afterEach, describe, expect, it, vi } from "vitest";
import {
  onMotionPreferenceChange,
  prefersReducedMotion,
  resetMotionForTests,
} from "@/utils/motion";

const stub = (initial: boolean) => {
  const listeners: (() => void)[] = [];
  const mq = {
    matches: initial,
    addEventListener: (_: string, f: () => void) => listeners.push(f),
    removeEventListener: (_: string, f: () => void) => listeners.splice(listeners.indexOf(f), 1),
  };
  const matchMedia = vi.fn(() => mq);
  vi.stubGlobal("window", { matchMedia });
  return {
    matchMedia,
    flip: (v: boolean) => {
      mq.matches = v;
      for (const f of [...listeners]) f();
    },
  };
};

afterEach(() => {
  vi.unstubAllGlobals();
  resetMotionForTests();
});

describe("prefersReducedMotion", () => {
  it("creates one MediaQueryList and answers from its cached value", () => {
    const s = stub(true);
    expect(prefersReducedMotion()).toBe(true);
    for (let i = 0; i < 50; i++) prefersReducedMotion();
    expect(s.matchMedia).toHaveBeenCalledTimes(1);
  });

  it("follows change events and tells subscribers, until they unsubscribe", () => {
    const s = stub(false);
    const seen: boolean[] = [];
    const off = onMotionPreferenceChange(() => seen.push(prefersReducedMotion()));
    expect(prefersReducedMotion()).toBe(false);
    s.flip(true);
    expect(seen).toEqual([true]);
    off();
    s.flip(false);
    expect(seen).toEqual([true]);
    expect(prefersReducedMotion()).toBe(false);
  });

  it("is false and silent where matchMedia does not exist", () => {
    vi.stubGlobal("window", {});
    expect(prefersReducedMotion()).toBe(false);
    expect(() => onMotionPreferenceChange(() => undefined)()).not.toThrow();
  });
});
