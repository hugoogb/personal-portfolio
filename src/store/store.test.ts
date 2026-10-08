import { describe, expect, it, vi } from "vitest";
import { ORDER } from "@/content/places";
import { STORE_KEY, createBaseCampStore } from "@/store/store";
import { createSafeStorage, type KeyValueStorage } from "@/store/storage";

const memory = (): KeyValueStorage => createSafeStorage(() => undefined);

describe("store", () => {
  it("selects a place and remembers it as discovered, once", () => {
    const store = createBaseCampStore(memory());
    store.getState().select("rl");
    store.getState().select("rl");
    expect(store.getState().selected).toBe("rl");
    expect(store.getState().discovered).toEqual(["rl"]);
  });

  it("deselects without forgetting what was discovered", () => {
    const store = createBaseCampStore(memory());
    store.getState().select("f1");
    store.getState().deselect();
    expect(store.getState().selected).toBeNull();
    expect(store.getState().discovered).toEqual(["f1"]);
  });

  it("unlocks Explorer once every place has been discovered", () => {
    const store = createBaseCampStore(memory());
    for (const id of ORDER.slice(0, -1)) store.getState().select(id);
    expect(store.getState().achievements).not.toContain("explorer");
    store.getState().select(ORDER[ORDER.length - 1]);
    expect(store.getState().achievements).toEqual(["explorer"]);
  });

  it("unlocks an achievement only once", () => {
    const store = createBaseCampStore(memory());
    expect(store.getState().unlock("goal")).toBe(true);
    expect(store.getState().unlock("goal")).toBe(false);
    expect(store.getState().achievements).toEqual(["goal"]);
  });

  it("persists only progress and preferences, under one key", () => {
    const storage = memory();
    const store = createBaseCampStore(storage);
    store.getState().select("rl");
    store.getState().unlock("hat");
    store.getState().setHudMode("dark");
    store.getState().setQualityMode("Low");
    store.getState().setPanel("settings");
    const saved = JSON.parse(storage.getItem(STORE_KEY) ?? "{}");
    expect(saved.state).toEqual({
      discovered: ["rl"],
      achievements: ["hat"],
      hudMode: "dark",
      qualityMode: "Low",
      seen: false,
    });
  });

  it("restores saved progress", () => {
    const storage = memory();
    storage.setItem(
      STORE_KEY,
      JSON.stringify({
        state: {
          discovered: ["rl", "f1"],
          achievements: ["night"],
          hudMode: "light",
          qualityMode: "auto",
          seen: true,
        },
        version: 1,
      }),
    );
    const store = createBaseCampStore(storage);
    expect(store.getState().discovered).toEqual(["rl", "f1"]);
    expect(store.getState().achievements).toEqual(["night"]);
    expect(store.getState().seen).toBe(true);
    expect(store.getState().selected).toBeNull();
  });

  it("ignores a corrupt saved record", () => {
    const storage = memory();
    storage.setItem(STORE_KEY, "{not json");
    const store = createBaseCampStore(storage);
    expect(store.getState().discovered).toEqual([]);
    expect(store.getState().qualityMode).toBe("auto");
  });

  it("keeps working when localStorage throws", () => {
    const store = createBaseCampStore(
      createSafeStorage(() => {
        throw new Error("SecurityError");
      }),
    );
    store.getState().select("es");
    expect(store.getState().discovered).toEqual(["es"]);
  });

  it("stores valid accents under the existing key and rejects others", () => {
    const storage = memory();
    const store = createBaseCampStore(storage);
    expect(store.getState().accent).toBe("#f97316");
    store.getState().setAccent("#10B981");
    expect(store.getState().accent).toBe("#10b981");
    expect(storage.getItem("color")).toBe("#10b981");
    store.getState().setAccent("green");
    expect(store.getState().accent).toBe("#10b981");
  });

  it("clears progress on reset but keeps preferences", () => {
    const store = createBaseCampStore(memory());
    store.getState().select("rl");
    store.getState().unlock("lap");
    store.getState().markSeen();
    store.getState().setHudMode("dark");
    store.getState().resetProgress();
    expect(store.getState().discovered).toEqual([]);
    expect(store.getState().achievements).toEqual([]);
    expect(store.getState().seen).toBe(false);
    expect(store.getState().hudMode).toBe("dark");
  });
});

describe("store restore", () => {
  it("keeps only valid fields from a wrong-typed saved record", () => {
    const storage = memory();
    storage.setItem(
      STORE_KEY,
      JSON.stringify({
        state: {
          discovered: ["rl", "nowhere", 7],
          achievements: null,
          hudMode: "neon",
          qualityMode: "Ultra",
          seen: "yes",
        },
        version: 1,
      }),
    );
    const store = createBaseCampStore(storage);
    const state = store.getState();
    expect(state.discovered).toEqual(["rl"]);
    expect(state.achievements).toEqual([]);
    expect(state.hudMode).toBe("auto");
    expect(state.qualityMode).toBe("auto");
    expect(state.seen).toBe(false);
    expect(() => state.unlock("goal")).not.toThrow();
  });

  it("restores a record from another version without logging an error", () => {
    const storage = memory();
    storage.setItem(
      STORE_KEY,
      JSON.stringify({ state: { discovered: ["f1"], seen: true }, version: 99 }),
    );
    const errors: unknown[] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => void errors.push(args);
    try {
      const store = createBaseCampStore(storage);
      expect(store.getState().discovered).toEqual(["f1"]);
    } finally {
      console.error = original;
    }
    expect(errors).toEqual([]);
  });
});

describe("store, phase 2", () => {
  it("derives the tier from the quality mode and the automatic tier", () => {
    const store = createBaseCampStore(memory());
    store.getState().setAutoTier(2);
    expect(store.getState().tier).toBe(2);
    store.getState().setQualityMode("Low");
    expect(store.getState().tier).toBe(1);
    store.getState().setAutoTier(3);
    expect(store.getState().tier).toBe(1);
    store.getState().setQualityMode("auto");
    expect(store.getState().tier).toBe(3);
  });

  it("caps the pixel ratio at the tier's, lowers it on request, and resets it with the tier", () => {
    const store = createBaseCampStore(memory());
    store.getState().setTier(2);
    expect(store.getState().dpr).toBe(1.5);
    store.getState().setDpr(1.25);
    expect(store.getState().dpr).toBe(1.25);
    // Never above the tier's own cap.
    store.getState().setDpr(3);
    expect(store.getState().dpr).toBe(1.5);
    store.getState().setDpr(1);
    store.getState().setTier(3);
    expect(store.getState().dpr).toBe(1.25);
    store.getState().setQualityMode("Low");
    expect(store.getState().dpr).toBe(1);
    store.getState().setQualityMode("Medium");
    expect(store.getState().dpr).toBe(1.5);
  });

  it("toasts an achievement once, by name", () => {
    const store = createBaseCampStore(memory());
    expect(store.getState().achieve("goal")).toBe(true);
    expect(store.getState().achieve("goal")).toBe(false);
    expect(store.getState().toasts.map((t) => t.text)).toEqual([
      "Achievement unlocked · Top corner",
    ]);
  });

  it("unlocks Operator when the console opens", () => {
    const store = createBaseCampStore(memory());
    store.getState().setConsoleOpen(true);
    expect(store.getState().consoleOpen).toBe(true);
    expect(store.getState().achievements).toEqual(["console"]);
  });

  it("closes the stack chips when another place is selected", () => {
    const store = createBaseCampStore(memory());
    store.getState().select("rl");
    store.getState().toggleStack();
    expect(store.getState().stackOpen).toBe(true);
    store.getState().select("f1");
    expect(store.getState().stackOpen).toBe(false);
  });

  it("numbers each camera goal so the same spot can be asked for twice", () => {
    const store = createBaseCampStore(memory());
    store.getState().focus(1, 2, 10);
    const first = store.getState().goal;
    store.getState().focus(1, 2, 10);
    const second = store.getState().goal;
    expect(first).toMatchObject({ x: 1, z: 2, view: 10 });
    expect(second!.seq).toBeGreaterThan(first!.seq);
  });

  it("dismisses toasts by id", () => {
    const store = createBaseCampStore(memory());
    store.getState().toast("one");
    store.getState().toast("two");
    const [first] = store.getState().toasts;
    store.getState().dismissToast(first.id);
    expect(store.getState().toasts.map((t) => t.text)).toEqual(["two"]);
  });

  it("timestamps a stadium wave", () => {
    vi.spyOn(Date, "now").mockReturnValue(1234);
    const store = createBaseCampStore(memory());
    store.getState().startWave();
    expect(store.getState().waveAt).toBe(1234);
  });

  it("keeps session state out of the saved record", () => {
    const storage = memory();
    const store = createBaseCampStore(storage);
    store.getState().focus(1, 2, 10);
    store.getState().toast("hi");
    store.getState().setFirstVisit(true);
    store.getState().setAutoTier(1);
    store.getState().select("rl");
    const saved = JSON.parse(storage.getItem(STORE_KEY) ?? "{}");
    expect(Object.keys(saved.state).sort()).toEqual([
      "achievements",
      "discovered",
      "hudMode",
      "qualityMode",
      "seen",
    ]);
  });
});

describe("store, phase 3", () => {
  it("overrides the town's hour without persisting it", () => {
    const storage = memory();
    const store = createBaseCampStore(storage);
    store.getState().setTimeOverride(23);
    expect(store.getState().timeOverride).toBe(23);
    store.getState().select("rl");
    const saved = JSON.parse(storage.getItem(STORE_KEY) ?? "{}");
    expect(saved.state.timeOverride).toBeUndefined();
  });

  it("asks the camera to jump or to re-frame", () => {
    const store = createBaseCampStore(memory());
    store.getState().focus(0, -1, 52, true);
    expect(store.getState().goal).toMatchObject({ x: 0, z: -1, view: 52, instant: true });
    const seq = store.getState().reframeSeq;
    store.getState().reframe();
    expect(store.getState().reframeSeq).toBe(seq + 1);
    store.getState().setIntroRunning(true);
    expect(store.getState().introRunning).toBe(true);
  });
});

describe("store, phase 4", () => {
  it("keeps the score out of the saved record", () => {
    const storage = memory();
    const store = createBaseCampStore(storage);
    store.getState().addGoal("Blue");
    store.getState().select("arena");
    const saved = JSON.parse(storage.getItem(STORE_KEY) ?? "{}");
    expect(saved.state.score).toBeUndefined();
  });

  it("counts goals and unlocks Top corner once", () => {
    const store = createBaseCampStore(memory());
    store.getState().addGoal("Blue");
    store.getState().addGoal("Orange");
    expect(store.getState().score).toBe(2);
    expect(store.getState().achievements.filter((a) => a === "goal")).toHaveLength(1);
    expect(store.getState().toasts.map((t) => t.text)).toContain("Goal! Blue net");
  });
});
