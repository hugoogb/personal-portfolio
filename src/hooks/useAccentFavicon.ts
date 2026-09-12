import { useEffect } from "react";
import { DEFAULT_COLOR } from "@/constants/colors.constants";

const SIZE = 64;

/** Same rule as --primary-fg in globals.css: a label that stays readable. */
const contrastOn = (hex: string) => {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
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

/**
 * Repaints the tab icon in whatever accent the visitor chose - so the thing
 * they changed follows them into the browser chrome.
 *
 * The default accent deliberately leaves the real favicon alone: the designed
 * icon is better than a generated one, and this should read as a reward for
 * having touched the picker rather than a replacement for the brand.
 */
export const useAccentFavicon = (color: string) => {
  useEffect(() => {
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

    // Hide the shipped icons rather than delete them: switching back to the
    // default accent has to be able to restore them.
    document
      .querySelectorAll<HTMLLinkElement>('link[rel="icon"]:not(#accent-favicon)')
      .forEach((link) => link.setAttribute("disabled", ""));

    const link = (generated as HTMLLinkElement | null) ?? document.createElement("link");
    link.id = "accent-favicon";
    link.rel = "icon";
    link.type = "image/png";
    link.href = href;
    if (!generated) document.head.appendChild(link);
  }, [color]);
};
