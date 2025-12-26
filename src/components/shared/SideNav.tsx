import { motion } from "motion/react";
import { FC } from "react";

interface SideNavProps {
  sectionIds: string[];
  activeSection: number;
  scrollToSection: (index: number) => void;
  activeColor: string;
}

export const SideNav: FC<SideNavProps> = ({
  sectionIds,
  activeSection,
  scrollToSection,
  activeColor,
}) => {
  return (
    <div className="fixed right-6 sm:right-8 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-6 items-center">
      {sectionIds.map((id, index) => {
        const isActive = activeSection === index;

        return (
          <button
            key={id}
            onClick={() => scrollToSection(index)}
            className="group relative flex items-center justify-center w-5 h-5"
            aria-label={`Scroll to ${id}`}
          >
            {/* Label tooltip */}
            <span className="absolute right-full mr-6 px-3 py-1.5 rounded-xl bg-card/80 backdrop-blur-md border border-border text-[10px] font-bold uppercase tracking-widest text-text opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 whitespace-nowrap pointer-events-none shadow-lg">
              {id}
            </span>

            {/* Inactive Dot */}
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-muted/20"
              animate={{
                opacity: isActive ? 0 : 1,
                scale: isActive ? 0.5 : 1,
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Active Indicator (Shared Layout) */}
            {isActive && (
              <motion.div
                layoutId="activeSideNav"
                className="absolute inset-0 flex items-center justify-center"
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 30,
                }}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: activeColor }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: activeColor }}
                  />
                </div>
              </motion.div>
            )}

            {/* Hover state for inactive dots */}
            {!isActive && (
              <motion.div
                className="absolute inset-0 rounded-full border border-muted/20 opacity-0 group-hover:opacity-100"
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
