// Color context
export interface ColorContextValue {
  color: string;
  setColor: (color: string) => void;
}

// Section navigation
export interface SectionNavValue {
  sectionIds: readonly string[];
  /** Index of the section currently considered active. */
  activeIndex: number;
  /** Scrolls to a section and marks it active immediately. */
  goToSection: (sectionId: string) => void;
}
