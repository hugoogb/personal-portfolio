export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * localStorage can be missing (server render) or throw on every call (private
 * windows, blocked site data). The town must still work in those cases, so
 * every write also lands in memory and reads fall back to it.
 */
export const createSafeStorage = (backend: () => Storage | undefined): KeyValueStorage => {
  const memory = new Map<string, string>();
  const attempt = <T>(apply: (s: Storage) => T, fallback: () => T): T => {
    try {
      const real = backend();
      return real ? apply(real) : fallback();
    } catch {
      return fallback();
    }
  };

  return {
    getItem: (key) =>
      attempt(
        (s) => s.getItem(key) ?? memory.get(key) ?? null,
        () => memory.get(key) ?? null,
      ),
    setItem: (key, value) => {
      memory.set(key, value);
      attempt(
        (s) => s.setItem(key, value),
        () => undefined,
      );
    },
    removeItem: (key) => {
      memory.delete(key);
      attempt(
        (s) => s.removeItem(key),
        () => undefined,
      );
    },
  };
};

export const safeStorage = (): KeyValueStorage =>
  createSafeStorage(() => (typeof localStorage === "undefined" ? undefined : localStorage));
