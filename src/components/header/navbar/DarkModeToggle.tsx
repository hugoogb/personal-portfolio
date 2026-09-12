import type { FC } from "react";
import { useContext } from "react";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import { ThemeContext } from "@/contexts/theme.context";

export const DarkModeToggle: FC = () => {
  const { isDark, toggleDark } = useContext(ThemeContext);

  return (
    <motion.button
      className="p-2 rounded-full hover:bg-muted/10 transition-colors text-text overflow-hidden relative cursor-pointer"
      onClick={toggleDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? "sun" : "moon"}
          initial={{ y: 20, opacity: 0, rotate: 45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -20, opacity: 0, rotate: -45 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? <IconSun size={20} stroke={1.5} /> : <IconMoon size={20} stroke={1.5} />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};
