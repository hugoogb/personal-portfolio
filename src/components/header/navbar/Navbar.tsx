import type { FC, MouseEvent } from "react";
import { useState, useEffect, useRef, useContext, useCallback, useMemo } from "react";
import { SettingsMenu } from "@/components/header/navbar/SettingsMenu";
import { NavBarItem } from "@/components/header/navbar/NavBarItem";
import { DarkModeToggle } from "@/components/header/navbar/DarkModeToggle";
import { AccentDots } from "@/components/header/navbar/AccentDots";
import { IconMenu2, IconSearch, IconX } from "@tabler/icons-react";
import { SectionNavContext } from "@/contexts/section-nav.context";
import { hashOf } from "@/utils/sectionHash";
import { toggleCommandPalette } from "@/utils/commandPalette";

export const Navbar: FC = () => {
  const { sectionIds, activeIndex, goToSection } = useContext(SectionNavContext);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const navbarRef = useRef<HTMLUListElement>(null);
  const iconMenuNavbarRef = useRef<HTMLButtonElement>(null);

  const shortcutLabel = useMemo(
    () => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘K" : "Ctrl K"),
    [],
  );

  const handleNavClick = useCallback(
    (sectionId: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      // The href is a real fragment so the link works without JS and can be
      // copied, but we scroll it ourselves to keep the active pill in step.
      e.preventDefault();
      setIsMenuOpen(false);
      goToSection(sectionId);
    },
    [goToSection],
  );

  const navItemsMapped = sectionIds.map((sectionId, index) => (
    <NavBarItem
      key={sectionId}
      id={index}
      href={hashOf(sectionId)}
      activeId={activeIndex}
      onClick={handleNavClick(sectionId)}
    >
      {sectionId}
    </NavBarItem>
  ));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | Event) => {
      const target = event.target as Node;
      if (
        navbarRef.current &&
        !navbarRef.current.contains(target) &&
        iconMenuNavbarRef.current &&
        !iconMenuNavbarRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-4 sm:gap-6">
      <nav className="relative flex items-center">
        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-1">{navItemsMapped}</ul>

        {/* Mobile Menu Button */}
        <button
          type="button"
          ref={iconMenuNavbarRef}
          className="md:hidden flex items-center cursor-pointer p-2 hover:bg-muted/10 rounded-full transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {isMenuOpen ? (
            <IconX size={24} className="text-text" />
          ) : (
            <IconMenu2 size={24} className="text-text" />
          )}
        </button>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <ul
            id="mobile-nav"
            ref={navbarRef}
            className="absolute top-full left-1/2 -translate-x-1/2 md:translate-x-0 md:left-0 mt-4 p-2 bg-background/95 backdrop-blur-lg border border-border rounded-2xl flex flex-col gap-1 md:hidden shadow-xl animate-fade-in z-50"
            style={{ width: "200px" }}
          >
            {navItemsMapped}
          </ul>
        )}
      </nav>

      <div className="flex items-center gap-1 pl-4 border-l border-border">
        <AccentDots />

        <button
          type="button"
          onClick={toggleCommandPalette}
          aria-label={`Open command palette (${shortcutLabel})`}
          className="flex items-center gap-1.5 p-2 xl:pl-2.5 xl:pr-2 rounded-full hover:bg-muted/10 transition-colors text-text cursor-pointer"
        >
          <IconSearch size={20} stroke={1.5} />
          <kbd className="hidden xl:block font-mono text-[10px] text-muted/70 border border-border rounded-md px-1.5 py-0.5 leading-none">
            {shortcutLabel}
          </kbd>
        </button>

        <DarkModeToggle />
        <SettingsMenu />
      </div>
    </div>
  );
};
