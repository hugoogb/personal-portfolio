import type { FC } from "react";
import { useEffect, useMemo, useState } from "react";
import { IconClock } from "@tabler/icons-react";

const TZ = "Europe/Madrid";
const WORK_START = 9;
const WORK_END = 19;

const normalize = (hour: number) => ((hour % 24) + 24) % 24;

const timeIn = (at: Date, timeZone?: string) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).format(at);

/**
 * "EU & US hours" is a claim a reader has to take on trust. This turns it into
 * something they can check: their own 24 hours, with the part of it I'm at my
 * desk for lit up.
 *
 * The offset is read by formatting the same instant twice and diffing the
 * results, so DST on either side is the browser's problem rather than ours.
 */
export const OverlapClock: FC = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const { segments, marker, isAtDesk, yourZone } = useMemo(() => {
    const offsetHours =
      (new Date(now.toLocaleString("en-US", { timeZone: TZ })).getTime() -
        new Date(now.toLocaleString("en-US")).getTime()) /
      3_600_000;

    const start = normalize(WORK_START - offsetHours);
    const end = normalize(WORK_END - offsetHours);

    const madridHour = Number(
      new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: TZ }).format(
        now,
      ),
    );

    return {
      // A window that crosses the visitor's midnight has to be drawn as two bands.
      segments:
        start < end
          ? [[start, end]]
          : [
              [start, 24],
              [0, end],
            ],
      marker: now.getHours() + now.getMinutes() / 60,
      isAtDesk: madridHour >= WORK_START && madridHour < WORK_END,
      yourZone: Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, " "),
    };
  }, [now]);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3.5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="flex items-center gap-2 font-display text-[13px] font-extrabold tracking-tight text-text">
          <IconClock size={15} stroke={1.8} className="text-muted" aria-hidden="true" />
          When we overlap
        </h3>
        <span className="text-[11px] font-semibold text-muted/70">
          {isAtDesk ? "at my desk right now" : "outside my hours"}
        </span>
      </div>

      <div>
        <div
          className="relative h-7 rounded-lg border border-border overflow-hidden bg-muted/5"
          role="img"
          aria-label={`I work ${WORK_START}:00 to ${WORK_END}:00 Barcelona time, which is shown against your local 24 hours.`}
        >
          {segments.map(([from, to]) => (
            <div
              key={`${from}-${to}`}
              className="absolute inset-y-0 bg-primary/85"
              style={{ left: `${(from / 24) * 100}%`, width: `${((to - from) / 24) * 100}%` }}
            />
          ))}
          <div
            className="absolute inset-y-0 w-px bg-text"
            style={{ left: `${(marker / 24) * 100}%` }}
            aria-hidden="true"
          />
        </div>

        <div className="flex justify-between mt-1.5 font-mono text-[10px] text-muted/60 tabular-nums">
          <span>00</span>
          <span>06</span>
          <span>12</span>
          <span>18</span>
          <span>24</span>
        </div>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-xs">
        <span className="text-muted">
          Barcelona <span className="font-mono text-text tabular-nums">{timeIn(now, TZ)}</span>
        </span>
        <span className="text-muted">
          You <span className="font-mono text-text tabular-nums">{timeIn(now)}</span>
          <span className="text-muted/60"> · {yourZone}</span>
        </span>
      </div>
    </div>
  );
};
