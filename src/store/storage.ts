export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const createSafeStorage = (backend: () => Storage | undefined): KeyValueStorage => {
  const attempt = <T>(apply: (s: Storage) => T, fallback: T): T => {
    try {
      const real = backend();
      return real ? apply(real) : fallback;
    } catch {
      return fallback;
    }
  };
  return {
    getItem: (key) => attempt((s) => s.getItem(key), null),
    setItem: (key, value) => attempt((s) => s.setItem(key, value), undefined),
    removeItem: (key) => attempt((s) => s.removeItem(key), undefined),
  };
};

export const safeStorage = (): KeyValueStorage =>
  createSafeStorage(() => (typeof localStorage === "undefined" ? undefined : localStorage));
