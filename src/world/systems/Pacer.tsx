import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

/** Early-frame tolerance: a 60 Hz display's frames arrive a little early or late. */
const SLACK_MS = 2;

/**
 * Draws the canvas (frameloop "never") at no more than `fps`. A 120 Hz display
 * gets every other frame, so the town costs a ProMotion laptop what it costs a
 * 60 Hz one, and Low gets its 30 fps (spec 8).
 */
export function Pacer({ fps }: { fps: number }) {
  const get = useThree((s) => s.get);
  useEffect(() => {
    const interval = 1000 / fps;
    let due = 0;
    let id = 0;
    let fresh = true;
    const loop = (now: number) => {
      id = requestAnimationFrame(loop);
      if (now < due - SLACK_MS) return;
      due += interval;
      // More than a frame behind (a slow frame, a shader compile): start the schedule again from now.
      if (due < now) due = now + interval;
      const state = get();
      // advance() takes its delta from the clock's last time, in seconds. On start (and after a
      // pause, which remounts this) make that one frame ago, so nothing jumps by the time away.
      if (fresh) {
        fresh = false;
        state.clock.elapsedTime = (now - interval) / 1000;
      }
      state.advance(now / 1000);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [get, fps]);
  return null;
}
