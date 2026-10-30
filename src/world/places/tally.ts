import * as THREE from "three";
import type { Kit } from "@/world/kit/kit";

export interface TallyLife {
  button: THREE.Group;
  glow: THREE.MeshStandardMaterial;
  screen: THREE.MeshStandardMaterial;
}

/** The digit window's backlight at rest; DayNight scales it down when the service is down. */
export const GLOW = 0.7;
/** The Wrap card's glow at rest, dimmed the same way. */
export const SCREEN = 0.8;

/** One tap every PRESS seconds, and the count goes up by one. */
const PRESS = 2.4;
const START = 428;

const PURPLE = "#7c5cff";
const INK = "#1d1530";
const PAPER = "#faf7f2";
const CHROME = "#c9ccd6";

/** A mechanical counter's window: four cells, the last one rolling. */
const drawDigits = (count: () => number) => (c: CanvasRenderingContext2D, w: number, h: number) => {
  c.fillStyle = INK;
  c.fillRect(0, 0, w, h);
  const digits = String(count() % 10000).padStart(4, "0");
  const pad = 12;
  const gap = 8;
  const cw = (w - pad * 2 - gap * 3) / 4;
  c.font = `800 ${Math.round(h * 0.62)}px "Hanken Grotesk", sans-serif`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  for (let i = 0; i < 4; i++) {
    const x = pad + i * (cw + gap);
    c.fillStyle = i === 3 ? "#ff5a36" : PAPER;
    c.fillRect(x, pad, cw, h - pad * 2);
    c.fillStyle = i === 3 ? PAPER : INK;
    c.fillText(digits[i]!, x + cw / 2, h / 2 + 3);
  }
};

/** A Wrap card, as the app shows it: the year's biggest count, then the mix. */
const drawWrap = (c: CanvasRenderingContext2D, w: number, h: number) => {
  const bg = c.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#3b1d66");
  bg.addColorStop(1, "#24113f");
  c.fillStyle = bg;
  c.fillRect(0, 0, w, h);
  c.textAlign = "left";
  c.textBaseline = "alphabetic";
  c.fillStyle = "#ffd23f";
  c.font = '700 15px "IBM Plex Mono", monospace';
  c.fillText("WRAPPED · 2026", 22, 42);
  c.fillStyle = "#ffffff";
  c.font = "italic 700 30px Georgia, serif";
  c.fillText("your year,", 22, 96);
  c.fillStyle = "#ffd23f";
  c.fillText("wrapped.", 22, 130);
  c.fillStyle = "#ff5a36";
  c.font = '800 92px "Hanken Grotesk", sans-serif';
  c.fillText("428", 18, 232);
  c.fillStyle = "#ffffff";
  c.font = '700 15px "IBM Plex Mono", monospace';
  c.fillText("PINTS IN '26", 24, 258);
  const rows: [string, number][] = [
    ["COFFEES", 16],
    ["GYM", 9],
    ["BOOKS", 6],
    ["RUNS", 4],
  ];
  rows.forEach(([label, n], i) => {
    const y = 304 + i * 38;
    c.fillStyle = "#e9e1ff";
    c.font = '600 14px "IBM Plex Mono", monospace';
    c.fillText(label, 24, y);
    c.fillStyle = "#ffd23f";
    c.font = '800 22px "Hanken Grotesk", sans-serif';
    c.textAlign = "right";
    c.fillText(String(n), w - 24, y);
    c.textAlign = "left";
    c.fillStyle = "rgba(255,255,255,.25)";
    c.fillRect(24, y + 12, w - 48, 2);
  });
  c.fillStyle = PAPER;
  c.fillRect(22, h - 66, w - 44, 40);
  c.fillStyle = "#24113f";
  c.font = '800 20px "Hanken Grotesk", sans-serif';
  c.fillText("32 logs", 36, h - 39);
};

/**
 * Wrapped Things: a giant hand tally counter, because the app is one. It stands
 * on its finger ring, clicks every couple of seconds and counts up; a Wrap card
 * and a few of the things people count sit round it.
 */
export function buildTally(kit: Kit): THREE.Group {
  const { rbox, cyl, mk, plaque, own, canvasTex } = kit;
  const g = new THREE.Group();
  rbox(2.9, 0.1, 2.9, "#ece6f7", 0, 0, 0, g, 0.05);
  rbox(1.9, 0.3, 1.2, "#d9cfff", 0, 0.1, -0.25, g, 0.08);

  // the clicker, turned a little toward the street
  const clicker = new THREE.Group();
  clicker.position.set(0, 0.4, -0.25);
  clicker.rotation.y = 0.3;
  g.add(clicker);
  const R = 0.85,
    D = 0.6,
    RING = 0.3,
    CY = RING * 2 + 0.1 + R;
  {
    mk(new THREE.TorusGeometry(RING, 0.08, 10, 28), CHROME, clicker, 0, RING + 0.08, 0);
    const body = mk(new THREE.CylinderGeometry(R, R, D, 40), PURPLE, clicker, 0, CY, 0);
    body.rotation.x = Math.PI / 2;
    for (const s of [-1, 1]) {
      const rim = mk(
        new THREE.TorusGeometry(R, 0.05, 8, 40),
        "#ffd23f",
        clicker,
        0,
        CY,
        s * (D / 2),
      );
      rim.castShadow = false;
    }
    const face = mk(
      new THREE.CylinderGeometry(R - 0.12, R - 0.12, 0.02, 40),
      "#9179ff",
      clicker,
      0,
      CY,
      D / 2 + 0.01,
      false,
    );
    face.rotation.x = Math.PI / 2;
  }
  let count = START;
  const digits = canvasTex(
    320,
    120,
    drawDigits(() => count),
  );
  const glow = own(
    new THREE.MeshStandardMaterial({
      map: digits,
      emissiveMap: digits,
      emissive: "#ffffff",
      emissiveIntensity: GLOW,
      roughness: 0.5,
    }),
  );
  mk(new THREE.PlaneGeometry(1.0, 0.375), glow, clicker, 0, CY + 0.12, D / 2 + 0.025, false);
  // the button on top, and the reset knob beside it
  const top = CY + R;
  cyl(0.11, 0.11, 0.2, CHROME, 0, top - 0.05, 0, clicker, 14);
  const button = new THREE.Group();
  button.position.set(0, top + 0.15, 0);
  button.userData.dynamic = true;
  clicker.add(button);
  cyl(0.26, 0.26, 0.14, "#ffd23f", 0, 0, 0, button, 24);
  cyl(0.1, 0.1, 0.1, CHROME, 0.62, CY + 0.52, 0, clicker, 12).rotation.z = -0.8;

  // the Wrap card, standing by
  {
    const card = new THREE.Group();
    card.position.set(0.95, 0.1, 0.8);
    card.rotation.set(-0.06, 0.3, 0.05);
    g.add(card);
    rbox(0.66, 1.2, 0.06, INK, 0, 0, 0, card, 0.04);
    rbox(0.3, 0.06, 0.3, INK, 0, 0, -0.08, card, 0.02);
  }
  const screen = own(
    new THREE.MeshStandardMaterial({
      roughness: 0.4,
      emissive: "#ffffff",
      emissiveIntensity: SCREEN,
    }),
  );
  screen.map = screen.emissiveMap = canvasTex(256, 480, drawWrap);
  {
    const sc = mk(new THREE.PlaneGeometry(0.58, 1.09), screen, g, 0, 0, 0, false);
    sc.position.set(0.95, 0.1 + 0.6, 0.8);
    sc.rotation.set(-0.06, 0.3, 0.05);
    sc.translateZ(0.035);
  }

  // things people count: a pint, a coffee, a dumbbell
  cyl(0.17, 0.14, 0.42, "#f2b134", -1.0, 0.1, 0.75, g, 18);
  cyl(0.18, 0.18, 0.09, PAPER, -1.0, 0.52, 0.75, g, 18);
  cyl(0.14, 0.12, 0.2, PAPER, -0.75, 0.1, 1.1, g, 18);
  cyl(0.06, 0.06, 0.02, "#6b4a35", -0.75, 0.3, 1.1, g, 12);
  {
    const hold = mk(new THREE.TorusGeometry(0.06, 0.02, 6, 14), PAPER, g, -0.6, 0.2, 1.1);
    hold.rotation.y = Math.PI / 2;
    const bar = mk(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 10), CHROME, g, 1.05, 0.2, -1.0);
    bar.rotation.z = Math.PI / 2;
    for (const s of [-1, 1]) {
      const plate = mk(
        new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16),
        INK,
        g,
        1.05 + s * 0.27,
        0.2,
        -1.0,
      );
      plate.rotation.z = Math.PI / 2;
    }
  }

  plaque(g, "WRAPPED THINGS", PURPLE, -0.35, 1.85, 1.0);
  kit.life.tally = { button, glow, screen };
  kit.onFrame((_dt, t) => {
    const into = t % PRESS;
    button.position.y = top + 0.15 - (into < 0.22 ? Math.sin((into / 0.22) * Math.PI) * 0.1 : 0);
    const next = START + Math.floor(t / PRESS);
    if (next !== count) {
      count = next;
      (digits.userData.redraw as () => void)();
    }
  });
  return g;
}
