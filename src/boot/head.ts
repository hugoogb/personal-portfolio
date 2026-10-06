/**
 * Runs inline in <head>, before first paint (injected by vite.config.ts).
 *
 * It paints the visitor's saved accent so the prerendered page never flashes
 * orange first, and marks html.can-world when this device could run the 3D
 * town: WebGL works, motion is welcome, Save-Data is off and the visitor has
 * not chosen Lite. Phase 2 uses the class to swap the Brief for the title card.
 *
 * It is shipped as its own source text (headScript below), so it must stay
 * self-contained: no imports, no helpers from outside this function.
 */
export function bootHead(doc: Document, win: Window): void {
  const root = doc.documentElement;
  let quality: unknown = null;

  try {
    const storage = win.localStorage;
    const accent = storage.getItem("color");
    if (accent && /^#[0-9a-fA-F]{6}$/.test(accent)) {
      root.style.setProperty("--primary-color", accent);
    }
    const saved = storage.getItem("bc");
    if (saved) quality = JSON.parse(saved)?.state?.qualityMode ?? null;
  } catch {
    // Storage blocked or a corrupt record: the defaults stand.
  }

  let webgl = false;
  try {
    const canvas = doc.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ||
      canvas.getContext("webgl")) as WebGLRenderingContext | null;
    webgl = Boolean(gl);
    // Browsers cap live contexts; give this probe's back straight away.
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl = false;
  }

  const reducedMotion =
    typeof win.matchMedia === "function" &&
    win.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const connection = (win.navigator as Navigator & { connection?: { saveData?: boolean } })
    .connection;
  const saveData = Boolean(connection?.saveData);

  if (webgl && !reducedMotion && !saveData && quality !== "Lite") root.classList.add("can-world");
}

export const headScript = `(${bootHead.toString()})(document, window);`;
