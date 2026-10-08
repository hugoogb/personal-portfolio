import { describe, expect, it } from "vitest";
import { createSafeStorage } from "@/store/storage";
import { createBaseCampStore } from "@/store/store";
import { shouldPlayBuildIn, skipBuildIn } from "@/world/lib/buildIn";

describe("shouldPlayBuildIn", () => {
  it("plays only on a first visit without reduced motion", () => {
    expect(shouldPlayBuildIn({ firstVisit: true, reducedMotion: false })).toBe(true);
    expect(shouldPlayBuildIn({ firstVisit: false, reducedMotion: false })).toBe(false);
    expect(shouldPlayBuildIn({ firstVisit: true, reducedMotion: true })).toBe(false);
  });
});

describe("skipBuildIn", () => {
  it("releases a camera still held by an abandoned build-in", () => {
    const store = createBaseCampStore(createSafeStorage(() => undefined));
    store.getState().setIntroRunning(true);
    skipBuildIn(store.getState());
    expect(store.getState().introRunning).toBe(false);
    expect(store.getState().introDone).toBe(true);
  });
});
