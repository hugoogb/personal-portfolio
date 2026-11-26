import { createStore } from "zustand/vanilla";
import { createJSONStorage, persist } from "zustand/middleware";
import { applyModeClass, isMode, readModeClass, type Mode } from "@/boot/mode";
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
  ms: number | null;
}
export type StatusMap = Partial<Record<PlaceId, ServiceStatus>>;

export interface CameraGoal {
  x: number;
  z: number;
  view: number;
  instant?: boolean;
  seq: number;
}

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
  autoTier: Tier;
  tier: Tier;
  dpr: number;
  fps: number;
  idle: boolean;
  consoleOpen: boolean;
  panel: Panel;
  driving: boolean;
  introDone: boolean;
  seen: boolean;
  firstVisit: boolean;
  stackOpen: boolean;
  goal: CameraGoal | null;
  introRunning: boolean;
  reframeSeq: number;
  timeOverride: number | null;
  view: CameraView;
  toasts: Toast[];
  waveAt: number;
  status: StatusMap | "unknown";
  score: number;
  mode: Mode;
  chosenMode: Mode | null;
  stop: number;
  town: "loading" | "ready" | "off";
  arrival: { id: PlaceId; seq: number } | null;

  select: (id: PlaceId) => void;
  deselect: () => void;
  setHover: (id: PlaceId | null) => void;
  unlock: (id: AchievementId) => boolean;
  achieve: (id: AchievementId) => boolean;
  setAccent: (hex: string) => void;
  setHudMode: (mode: HudMode) => void;
  setQualityMode: (mode: QualityMode) => void;
  setAutoTier: (tier: Tier) => void;
  setTier: (tier: Tier) => void;
  setDpr: (dpr: number) => void;
  setFps: (fps: number) => void;
  setIdle: (idle: boolean) => void;
  setPanel: (panel: Panel) => void;
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
  setMode: (mode: Mode) => void;
  chooseMode: (mode: Mode) => void;
  setStop: (stop: number) => void;
  setTown: (town: "loading" | "ready" | "off") => void;
  arrive: (id: PlaceId) => void;
}

export const STORE_KEY = "bc";

const HUD_MODES: readonly HudMode[] = ["auto", "light", "dark"];
const QUALITY_MODES: readonly QualityMode[] = ["auto", ...TIER_NAMES];

const isOneOf = <T>(allowed: readonly T[], value: unknown): value is T =>
  allowed.includes(value as T);

const listOf = <T>(allowed: readonly T[], value: unknown): T[] =>
  Array.isArray(value) ? value.filter((item): item is T => isOneOf(allowed, item)) : [];

type Persisted = Pick<
  BaseCampState,
  "discovered" | "achievements" | "hudMode" | "qualityMode" | "seen" | "chosenMode"
>;

const restore = (saved: unknown): Partial<Persisted> => {
  if (!saved || typeof saved !== "object") return {};
  const s = saved as Record<string, unknown>;
  return {
    chosenMode: isMode(s.chosenMode) ? s.chosenMode : null,
    discovered: listOf(ORDER, s.discovered),
    achievements: listOf(ACHIEVEMENT_IDS, s.achievements),
    hudMode: isOneOf(HUD_MODES, s.hudMode) ? s.hudMode : "auto",
    qualityMode: isOneOf(QUALITY_MODES, s.qualityMode) ? s.qualityMode : "auto",
    seen: s.seen === true,
  };
};

let nextToastId = 1;
let nextGoalSeq = 1;
let nextArrivalSeq = 1;

export const createBaseCampCore = (storage: KeyValueStorage = safeStorage()) =>
  createStore<BaseCampState>()(
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
        dpr: MAX_DPR[3],
        fps: 60,
        idle: false,
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
        mode: typeof document === "undefined" ? "text" : readModeClass(),
        chosenMode: null,
        stop: 0,
        town: "loading",
        arrival: null,

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
        setDpr: (dpr) => set((s) => ({ dpr: Math.min(dpr, MAX_DPR[s.tier]) })),
        setFps: (fps) => set({ fps }),
        setIdle: (idle) => set({ idle }),
        setPanel: (panel) => set({ panel }),
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
        setMode: (mode) => {
          if (typeof document !== "undefined") applyModeClass(mode);
          set({ mode });
        },
        chooseMode: (chosenMode) => set({ chosenMode }),
        setStop: (stop) => set({ stop }),
        setTown: (town) => set({ town }),
        arrive: (id) => set({ arrival: { id, seq: nextArrivalSeq++ } }),
      }),
      {
        name: STORE_KEY,
        version: 1,
        storage: createJSONStorage(() => storage),
        migrate: (saved) => saved as Persisted,
        merge: (saved, current) => ({ ...current, ...restore(saved), mode: current.mode }),
        partialize: (s): Persisted => ({
          discovered: s.discovered,
          achievements: s.achievements,
          hudMode: s.hudMode,
          qualityMode: s.qualityMode,
          seen: s.seen,
          chosenMode: s.chosenMode,
        }),
      },
    ),
  );

export const baseCamp = createBaseCampCore();
