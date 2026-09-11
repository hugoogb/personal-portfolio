import type { FC, ReactNode } from "react";
import { SERVICES } from "@/constants/services.constants";
import type { Service } from "@/constants/services.constants";
import { motion } from "motion/react";

const Row: FC<{ service: Service }> = ({ service }) => (
  <>
    <span
      className={`w-2.5 h-2.5 rounded-full shrink-0 ${service.running ? "bg-primary" : "bg-muted/30"}`}
      aria-hidden="true"
    />
    <span className="flex flex-col gap-0.5 min-w-0 flex-grow">
      <span className="font-mono text-xs sm:text-[13px] text-text truncate">{service.host}</span>
      <span className="text-[11px] sm:text-xs font-medium text-muted/80">{service.meta}</span>
    </span>
    <span className="text-[11px] font-semibold text-muted/70 shrink-0">{service.state}</span>
  </>
);

export const ServicePanel: FC = () => {
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
          const content: ReactNode = <Row service={service} />;
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
    </motion.div>
  );
};
