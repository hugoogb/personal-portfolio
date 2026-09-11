import { createContext } from "react";
import type { SectionNavValue } from "@/types/common.types";

/**
 * The single source of truth for which section is active.
 *
 * The navbar used to run its own `useScrollSpy`, independent of the one in
 * Layout. Layout suppresses scrollspy updates while a programmatic scroll is in
 * flight; the navbar's copy did not, so during a jump it reported every section
 * the animation physically passed through and the pill visited each one.
 */
export const SectionNavContext = createContext<SectionNavValue>({
  sectionIds: [],
  activeIndex: 0,
  goToSection: () => {},
});
