import { useEffect } from "react";
import { useBaseCamp } from "@/store/store";

/** Seconds without input before the town counts as idle. */
export const IDLE_AFTER_MS = 20_000;

const INPUT = ["pointerdown", "pointermove", "wheel", "keydown", "touchstart"] as const;

/**
 * Keeps the store's `idle` flag: true after IDLE_AFTER_MS without input, or
 * while the window does not have focus (another app in front of a visible
 * tab). Any input or regaining focus clears it at once.
 */
export const useIdle = () => {
  useEffect(() => {
    let timer = 0;
    const set = (idle: boolean) => {
      if (useBaseCamp.getState().idle !== idle) useBaseCamp.getState().setIdle(idle);
    };
    const arm = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => set(true), IDLE_AFTER_MS);
    };
    const onInput = () => {
      set(false);
      arm();
    };
    const onBlur = () => {
      window.clearTimeout(timer);
      set(true);
    };
    for (const type of INPUT) window.addEventListener(type, onInput, { passive: true });
    window.addEventListener("focus", onInput);
    window.addEventListener("blur", onBlur);
    if (document.hasFocus()) arm();
    else set(true);
    return () => {
      window.clearTimeout(timer);
      for (const type of INPUT) window.removeEventListener(type, onInput);
      window.removeEventListener("focus", onInput);
      window.removeEventListener("blur", onBlur);
      set(false);
    };
  }, []);
};
