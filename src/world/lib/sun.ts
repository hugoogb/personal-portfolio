export const SUNRISE = 7 + 42 / 60;
export const SUNSET = 19 + 24 / 60;

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const dayAmount = (h: number) =>
  smoothstep(SUNRISE - 0.7, SUNRISE + 0.9, h) * (1 - smoothstep(SUNSET - 0.9, SUNSET + 0.8, h));

export const nightAmount = (h: number) => 1 - dayAmount(h);

const FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Madrid",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export const barcelonaHour = (date: Date) => {
  const parts = FORMAT.formatToParts(date);
  const read = (type: "hour" | "minute") => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return read("hour") + read("minute") / 60;
};

export const clockText = (h: number) => {
  const hours = Math.floor(h);
  const minutes = Math.floor((h - hours) * 60 + 1e-6);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

export const effectiveHour = (override: number | null, now: Date) => override ?? barcelonaHour(now);
