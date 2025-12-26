import type { FC } from "react";
import { useState, useEffect } from "react";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";

export const DarkModeToggle: FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDarkModeEnabled =
      localStorage.getItem("isDarkMode") === "true" ||
      (!localStorage.getItem("isDarkMode") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    setIsDarkMode(isDarkModeEnabled);

    if (isDarkModeEnabled) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    localStorage.setItem("isDarkMode", newIsDarkMode.toString());

    if (newIsDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <motion.button
      className="p-2 rounded-full hover:bg-muted/10 transition-colors text-text overflow-hidden relative cursor-pointer"
      onClick={toggleDarkMode}
      aria-label="Toggle dark mode"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDarkMode ? "sun" : "moon"}
          initial={{ y: 20, opacity: 0, rotate: 45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -20, opacity: 0, rotate: -45 }}
          transition={{ duration: 0.2 }}
        >
          {isDarkMode ? <IconSun size={20} stroke={1.5} /> : <IconMoon size={20} stroke={1.5} />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};
