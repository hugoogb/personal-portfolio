import type { FC } from "react";
import { useContext } from "react";
import { motion } from "motion/react";
import { ColorContext } from "@/contexts/color.context";
import { PRESET_COLORS } from "@/constants/colors.constants";

/**
 * The accent picker used to live behind a gear icon, which meant the one thing
 * on the page that responds to the visitor was also the thing nobody found.
 * The presets sit in the navbar now; the gear keeps the custom picker.
 */
export const AccentDots: FC = () => {
  const { color, setColor } = useContext(ColorContext);

  return (
    <div
      className="hidden lg:flex items-center gap-1.5 pr-2"
      role="group"
      aria-label="Accent color"
    >
      {PRESET_COLORS.map((preset) => {
        const isActive = color.toLowerCase() === preset.color.toLowerCase();

        return (
          <motion.button
            key={preset.color}
            type="button"
            onClick={() => setColor(preset.color)}
            aria-label={`${preset.name} accent`}
            aria-pressed={isActive}
            title={preset.name}
            className="relative w-3 h-3 rounded-full cursor-pointer shrink-0"
            style={{ backgroundColor: preset.color }}
            whileHover={{ scale: 1.35 }}
            whileTap={{ scale: 0.9 }}
          >
            {isActive && (
              <motion.span
                layoutId="accent-dot-ring"
                className="absolute -inset-1 rounded-full border"
                style={{ borderColor: preset.color }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
