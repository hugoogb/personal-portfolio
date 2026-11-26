import { useEffect } from "react";
import { useBaseCamp } from "@/store/store";

export const IDLE_AFTER_MS = 20_000;

const INPUT = ["pointerdown", "pointermove", "wheel", "keydown", "touchstart"] as const;

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
