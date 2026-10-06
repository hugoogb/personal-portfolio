import { DEFAULT_COLOR } from "@/constants/colors.constants";
import { STORAGE_KEYS } from "@/constants/strings.constants";
import { safeStorage, type KeyValueStorage } from "@/store/storage";

const HEX = /^#[0-9a-f]{6}$/i;

export const isHexColor = (value: unknown): value is string =>
  typeof value === "string" && HEX.test(value);

/** The accent the visitor picked, under the key today's site already uses. */
export const readAccent = (storage: KeyValueStorage = safeStorage()): string => {
  const stored = storage.getItem(STORAGE_KEYS.COLOR);
  return isHexColor(stored) ? stored.toLowerCase() : DEFAULT_COLOR;
};

export const writeAccent = (hex: string, storage: KeyValueStorage = safeStorage()): void => {
  if (isHexColor(hex)) storage.setItem(STORAGE_KEYS.COLOR, hex.toLowerCase());
};
