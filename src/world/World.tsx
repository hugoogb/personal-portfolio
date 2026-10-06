import { useEffect } from "react";

/** Replaced in Task 6. */
export default function World({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return null;
}
