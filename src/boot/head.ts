/**
 * Runs inline in <head>, before first paint (injected by vite.config.ts).
 *
 * It paints the visitor's saved accent so the prerendered page never flashes
 * orange first. It marks html.has-webgl when WebGL works (the Brief then offers
 * "Enter the town anyway"), and html.can-world plus html.world when this device
 * should get the town: CSS swaps the Brief for the title card before first
 * paint, and Boot removes html.world again if the GPU check says Lite.
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
    // The town needs WebGL2 (three r163+ dropped WebGL1), so only WebGL2 counts.
    const gl = canvas.getContext("webgl2") as WebGL2RenderingContext | null;
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

  // Boot sets this when the town failed to draw, so a broken device does not wait again.
  let failed = false;
  try {
    failed = win.sessionStorage.getItem("bc-town-failed") === "1";
  } catch {
    failed = false;
  }

  if (webgl) root.classList.add("has-webgl");
  // A saved manual quality (including "Enter the town anyway", which saves Low)
  // outranks reduced motion and Save-Data: the visitor asked for the town.
  const manual = quality === "High" || quality === "Medium" || quality === "Low";
  if (webgl && !failed && quality !== "Lite" && (manual || (!reducedMotion && !saveData))) {
    root.classList.add("can-world", "world");
  }
}

export const headScript = `(${bootHead.toString()})(document, window);`;
