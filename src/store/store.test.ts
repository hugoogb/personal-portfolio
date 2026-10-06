import { describe, expect, it } from "vitest";
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
