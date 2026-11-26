import { DEFAULT_COLOR } from "@/constants/colors.constants";
import { baseCamp } from "@/store/core";

const SIZE = 64;

const contrastOn = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  return luminance > 0.45 ? "#000000" : "#ffffff";
};

const draw = (color: string): string | null => {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const radius = 14;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(0, 0, SIZE, SIZE, radius);
  ctx.fill();

  ctx.fillStyle = contrastOn(color);
  ctx.font = "700 42px 'Hanken Grotesk', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("H", SIZE / 2, SIZE / 2 + 2);

  return canvas.toDataURL("image/png");
};

const paint = (color: string) => {
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);

  const generated = document.getElementById("accent-favicon");
  const isDefault = color.toLowerCase() === DEFAULT_COLOR.toLowerCase();

  if (isDefault) {
    generated?.remove();
    document
      .querySelectorAll<HTMLLinkElement>('link[rel="icon"]:not(#accent-favicon)')
      .forEach((link) => link.removeAttribute("disabled"));
    return;
  }

  const href = draw(color);
  if (!href) return;

  document
    .querySelectorAll<HTMLLinkElement>('link[rel="icon"]:not(#accent-favicon)')
    .forEach((link) => link.setAttribute("disabled", ""));

  const link = (generated as HTMLLinkElement | null) ?? document.createElement("link");
  link.id = "accent-favicon";
  link.rel = "icon";
  link.type = "image/png";
  link.href = href;
  if (!generated) document.head.appendChild(link);
};

export const startAccentFavicon = () => {
  paint(baseCamp.getState().accent);
  return baseCamp.subscribe((s, prev) => {
    if (s.accent !== prev.accent) paint(s.accent);
  });
};
