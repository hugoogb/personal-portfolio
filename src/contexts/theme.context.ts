import { createContext } from "react";
import type { ThemeContextValue } from "@/types/common.types";

/**
 * Dark mode lived inside DarkModeToggle, which made it unreachable from
 * anywhere else - the command palette needs to flip it too. The class on
 * <html> is still the source of truth; this only mirrors it for React.
 */
export const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  toggleDark: () => {},
});
