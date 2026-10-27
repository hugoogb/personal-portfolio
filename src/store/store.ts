import { useStore } from "zustand";
import { baseCamp, createBaseCampCore, type BaseCampState } from "@/store/core";
import type { KeyValueStorage } from "@/store/storage";

export * from "@/store/core";

type Core = ReturnType<typeof createBaseCampCore>;

/** The store as a React hook, plus its getState/setState/subscribe. Only the town's code imports this. */
const bind = (api: Core) =>
  Object.assign(<T>(selector: (s: BaseCampState) => T): T => useStore(api, selector), api);

export const createBaseCampStore = (storage?: KeyValueStorage) => bind(createBaseCampCore(storage));

export const useBaseCamp = bind(baseCamp);
