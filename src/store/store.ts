import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MAX_DPR, TIER_NAMES, resolveTier, type QualityMode, type Tier } from "@/boot/tiers";
import { ACHIEVEMENT_BY_ID, ACHIEVEMENT_IDS, type AchievementId } from "@/content/achievements";
import { ORDER } from "@/content/places";
import type { PlaceId } from "@/content/types";
import { isHexColor, readAccent, writeAccent } from "@/store/accent";
import { safeStorage, type KeyValueStorage } from "@/store/storage";

export type { AchievementId } from "@/content/achievements";
export type HudMode = "auto" | "light" | "dark";
export type Panel = "trophies" | "settings" | null;
export interface ServiceStatus {
  ok: boolean;
  /** Round trip in milliseconds, or null when the request never completed. */
  ms: number | null;
}
export type StatusMap = Partial<Record<PlaceId, ServiceStatus>>;

/** Where the HUD asks the camera to go; `seq` makes a repeat request a new one. */
export interface CameraGoal {
  x: number;
  z: number;
  view: number;
  /** Jump there at once instead of easing. */
  instant?: boolean;
  seq: number;
}

/** Where the camera is, published a few times a second for the minimap. */
export interface CameraView {
  x: number;
  z: number;
  view: number;
  aspect: number;
}

export interface Toast {
  id: number;
  text: string;
}

export interface BaseCampState {
  selected: PlaceId | null;
  hover: PlaceId | null;
  discovered: PlaceId[];
  achievements: AchievementId[];
  accent: string;
  hudMode: HudMode;
  qualityMode: QualityMode;
  /** What the device signals chose; a manual quality mode overrides it. */
  autoTier: Tier;
  tier: Tier;
  /** The tier boot started on; analytics only, never persisted. */
  bootTier: Tier | null;
  /** The canvas's pixel-ratio cap: the tier's, until the governor lowers it. Any tier change resets it. */
  dpr: number;
  fps: number;
  briefOpen: boolean;
  consoleOpen: boolean;
  panel: Panel;
  driving: boolean;
  introDone: boolean;
  /** The build-in has played once; returning visitors skip it. */
  seen: boolean;
  /** This visit is the first one: the objective tracker shows. */
  firstVisit: boolean;
  /** The selected card is showing its stack chips (E). */
  stackOpen: boolean;
  goal: CameraGoal | null;
  /** The build-in is holding the camera at the overview. */
  introRunning: boolean;
  /** Bumped to ask the camera to re-frame the selection. */
  reframeSeq: number;
  /** A preview hour that replaces the real one; never persisted. */
  timeOverride: number | null;
  view: CameraView;
  toasts: Toast[];
  /** When the last stadium wave started (ms since epoch), 0 for never. */
  waveAt: number;
  status: StatusMap | "unknown";
  /** Goals scored in the arena this visit; never saved. */
  score: number;

  select: (id: PlaceId) => void;
  deselect: () => void;
  setHover: (id: PlaceId | null) => void;
  /** True when this call unlocked it, false when it already was. */
  unlock: (id: AchievementId) => boolean;
  /** unlock() plus the toast that announces it. */
  achieve: (id: AchievementId) => boolean;
  setAccent: (hex: string) => void;
  setHudMode: (mode: HudMode) => void;
  setQualityMode: (mode: QualityMode) => void;
  setAutoTier: (tier: Tier) => void;
  setTier: (tier: Tier) => void;
  setBootTier: (tier: Tier) => void;
  setDpr: (dpr: number) => void;
  setFps: (fps: number) => void;
  setPanel: (panel: Panel) => void;
  setBriefOpen: (open: boolean) => void;
  setConsoleOpen: (open: boolean) => void;
  setDriving: (on: boolean) => void;
  toggleStack: () => void;
  focus: (x: number, z: number, view: number, instant?: boolean) => void;
  setTimeOverride: (hour: number | null) => void;
  setIntroRunning: (on: boolean) => void;
  reframe: () => void;
  setView: (view: CameraView) => void;
  toast: (text: string) => void;
  dismissToast: (id: number) => void;
  startWave: () => void;
  setFirstVisit: (first: boolean) => void;
  markIntroDone: () => void;
  markSeen: () => void;
  setStatus: (status: StatusMap | "unknown") => void;
  addGoal: (side: "Blue" | "Orange") => void;
  resetProgress: () => void;
}

/** One record for everything persisted except the accent, which keeps today's "color" key. */
export const STORE_KEY = "bc";

const HUD_MODES: readonly HudMode[] = ["auto", "light", "dark"];
const QUALITY_MODES: readonly QualityMode[] = ["auto", ...TIER_NAMES];

const isOneOf = <T>(allowed: readonly T[], value: unknown): value is T =>
  allowed.includes(value as T);

const listOf = <T>(allowed: readonly T[], value: unknown): T[] =>
  Array.isArray(value) ? value.filter((item): item is T => isOneOf(allowed, item)) : [];

type Persisted = Pick<
  BaseCampState,
  "discovered" | "achievements" | "hudMode" | "qualityMode" | "seen"
>;

/**
 * The saved record is whatever a visitor's browser hands back: an older shape,
 * a hand-edited value, another version. Each field is kept only when it is
 * valid, so one bad field falls back to its default instead of breaking the HUD.
 */
const restore = (saved: unknown): Partial<Persisted> => {
  if (!saved || typeof saved !== "object") return {};
  const s = saved as Record<string, unknown>;
  return {
    discovered: listOf(ORDER, s.discovered),
    achievements: listOf(ACHIEVEMENT_IDS, s.achievements),
    hudMode: isOneOf(HUD_MODES, s.hudMode) ? s.hudMode : "auto",
    qualityMode: isOneOf(QUALITY_MODES, s.qualityMode) ? s.qualityMode : "auto",
    seen: s.seen === true,
  };
};

let nextToastId = 1;
let nextGoalSeq = 1;

export const createBaseCampStore = (storage: KeyValueStorage = safeStorage()) =>
  create<BaseCampState>()(
    persist(
      (set, get) => ({
        selected: null,
        hover: null,
        discovered: [],
        achievements: [],
        accent: readAccent(storage),
        hudMode: "auto",
        qualityMode: "auto",
        autoTier: 3,
        tier: 3,
        bootTier: null,
        dpr: MAX_DPR[3],
        fps: 60,
        briefOpen: false,
        consoleOpen: false,
        panel: null,
        driving: false,
        introDone: false,
        seen: false,
        firstVisit: false,
        stackOpen: false,
        goal: null,
        introRunning: false,
        reframeSeq: 0,
        timeOverride: null,
        view: { x: 0, z: 0, view: 30, aspect: 16 / 9 },
        toasts: [],
        waveAt: 0,
        status: "unknown",
        score: 0,

        select: (id) => {
          set((s) => ({
            selected: id,
            stackOpen: false,
            discovered: s.discovered.includes(id) ? s.discovered : [...s.discovered, id],
          }));
          if (ORDER.every((place) => get().discovered.includes(place))) get().achieve("explorer");
        },
        deselect: () => set({ selected: null, stackOpen: false }),
        setHover: (hover) => set({ hover }),
        unlock: (id) => {
          if (get().achievements.includes(id)) return false;
          set((s) => ({ achievements: [...s.achievements, id] }));
          return true;
        },
        achieve: (id) => {
          if (!get().unlock(id)) return false;
          get().toast(`Achievement unlocked · ${ACHIEVEMENT_BY_ID[id].name}`);
          return true;
        },
        setAccent: (hex) => {
          if (!isHexColor(hex)) return;
          const accent = hex.toLowerCase();
          writeAccent(accent, storage);
          if (typeof document !== "undefined") {
            document.documentElement.style.setProperty("--primary-color", accent);
          }
          set({ accent });
        },
        setHudMode: (hudMode) => set({ hudMode }),
        setQualityMode: (qualityMode) =>
          set((s) => {
            const tier = resolveTier(qualityMode, s.autoTier);
            return { qualityMode, tier, dpr: MAX_DPR[tier] };
          }),
        setAutoTier: (autoTier) =>
          set((s) => {
            const tier = resolveTier(s.qualityMode, autoTier);
            return { autoTier, tier, dpr: MAX_DPR[tier] };
          }),
        setTier: (tier) => set({ tier, dpr: MAX_DPR[tier] }),
        setBootTier: (bootTier) => set({ bootTier }),
        setDpr: (dpr) => set((s) => ({ dpr: Math.min(dpr, MAX_DPR[s.tier]) })),
        setFps: (fps) => set({ fps }),
        setPanel: (panel) => set({ panel }),
        setBriefOpen: (briefOpen) => set({ briefOpen }),
        setConsoleOpen: (consoleOpen) => {
          set({ consoleOpen });
          if (consoleOpen) get().achieve("console");
        },
        setDriving: (driving) => set({ driving }),
        toggleStack: () => set((s) => ({ stackOpen: !s.stackOpen })),
        focus: (x, z, view, instant) => set({ goal: { x, z, view, instant, seq: nextGoalSeq++ } }),
        setTimeOverride: (timeOverride) => set({ timeOverride }),
        setIntroRunning: (introRunning) => set({ introRunning }),
        reframe: () => set((s) => ({ reframeSeq: s.reframeSeq + 1 })),
        setView: (view) => set({ view }),
        toast: (text) => set((s) => ({ toasts: [...s.toasts, { id: nextToastId++, text }] })),
        dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
        startWave: () => set({ waveAt: Date.now() }),
        setFirstVisit: (firstVisit) => set({ firstVisit }),
        markIntroDone: () => set({ introDone: true }),
        markSeen: () => set({ seen: true }),
        setStatus: (status) => set({ status }),
        addGoal: (side) => {
          set((s) => ({ score: s.score + 1 }));
          get().toast(`Goal! ${side} net`);
          get().achieve("goal");
        },
        resetProgress: () => set({ discovered: [], achievements: [], seen: false }),
      }),
      {
        name: STORE_KEY,
        version: 1,
        storage: createJSONStorage(() => storage),
        // Every version goes through restore(), so no record needs migrating.
        migrate: (saved) => saved as Persisted,
        merge: (saved, current) => ({ ...current, ...restore(saved) }),
        partialize: (s): Persisted => ({
          discovered: s.discovered,
          achievements: s.achievements,
          hudMode: s.hudMode,
          qualityMode: s.qualityMode,
          seen: s.seen,
        }),
      },
    ),
  );

/** The app's store. Tests build their own with createBaseCampStore. */
export const useBaseCamp = createBaseCampStore();
