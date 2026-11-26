import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

const SLACK_MS = 2;

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
      if (due < now) due = now + interval;
      const state = get();
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
