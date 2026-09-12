import type { FC, ReactNode } from "react";
import { useEffect, useState } from "react";
import { SERVICES } from "@/constants/services.constants";
import type { Service } from "@/constants/services.constants";
import { motion } from "motion/react";

interface Probe {
  host: string;
  ok: boolean;
  status: number;
  /** Round trip in milliseconds, or null when the request never completed. */
  ms: number | null;
}

/**
 * Past this, the number stops being worth showing. The probe runs from an edge
 * region on the other side of the Atlantic, so a cold start there says nothing
 * true about the site - and "1006 ms" on a portfolio reads as a confession
 * rather than a measurement. Under it, the real figure is the better answer.
 */
const FAST_MS = 400;

const describe = (service: Service, probe?: Probe) => {
  // Until the probe lands, the hand-written state is what the row says - so the
  // panel is never empty and never claims anything it has not been told.
  if (!probe) return service.state;
  if (!probe.ok || probe.ms === null) return "unreachable";
  return probe.ms <= FAST_MS ? `${probe.ms} ms` : "live";
};

const Row: FC<{ service: Service; probe?: Probe }> = ({ service, probe }) => {
  const isUp = probe ? probe.ok : service.running;
  const detail = describe(service, probe);

  return (
    <>
      <span
        className={`w-2.5 h-2.5 rounded-full shrink-0 ${isUp ? "bg-primary" : "bg-muted/30"}`}
        aria-hidden="true"
      />
      <span className="flex flex-col gap-0.5 min-w-0 flex-grow">
        <span className="font-mono text-xs sm:text-[13px] text-text truncate">{service.host}</span>
        <span className="text-[11px] sm:text-xs font-medium text-muted/80">{service.meta}</span>
      </span>
      <span className="font-mono text-[11px] font-medium text-muted/70 shrink-0 tabular-nums">
        {detail}
      </span>
    </>
  );
};

export const ServicePanel: FC = () => {
  const [probes, setProbes] = useState<Record<string, Probe> | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/status", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
      .then((data: { services?: Probe[] }) => {
        if (!Array.isArray(data.services)) return;
        setProbes(Object.fromEntries(data.services.map((probe) => [probe.host, probe])));
      })
      .catch(() => {
        // No endpoint (the Vite dev server has none) or it failed: the static
        // states already on screen stand in, so there is nothing to handle.
      });

    return () => controller.abort();
  }, []);

  return (
    <motion.div
      className="w-full max-w-md bg-card border border-border rounded-3xl overflow-hidden shadow-sm"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
    >
      <div className="px-6 pt-5 pb-4">
        <h2 className="font-display text-[15px] font-extrabold tracking-tight text-text">
          Out in the world
        </h2>
      </div>

      <ul>
        {SERVICES.map((service) => {
          const content: ReactNode = <Row service={service} probe={probes?.[service.host]} />;
          return (
            <li key={service.host} className="border-t border-border/60">
              {service.url ? (
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 px-6 py-3.5 hover:bg-muted/5 transition-colors"
                >
                  {content}
                </a>
              ) : (
                <div className="flex items-center gap-3.5 px-6 py-3.5">{content}</div>
              )}
            </li>
          );
        })}
      </ul>

      {probes && (
        <p className="px-6 py-2.5 border-t border-border/60 font-mono text-[10px] text-muted/60">
          reachability checked from the edge · cached 60s
        </p>
      )}
    </motion.div>
  );
};
