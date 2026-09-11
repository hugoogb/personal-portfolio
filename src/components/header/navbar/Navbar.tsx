import type { FC, MouseEvent } from "react";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { SettingsMenu } from "@/components/header/navbar/SettingsMenu";
import { NavBarItem } from "@/components/header/navbar/NavBarItem";
import { DarkModeToggle } from "@/components/header/navbar/DarkModeToggle";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { scrollToSection } from "@/utils/scrollToSection";

export const Navbar: FC = () => {
  const [activeId, setActiveId] = useState<number | null>(0);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const navbarRef = useRef<HTMLUListElement>(null);
  const iconMenuNavbarRef = useRef<HTMLButtonElement>(null);

  const navItems = useMemo(
    () => [
      { id: 0, name: "Home", sectionId: "Home" },
      { id: 1, name: "About", sectionId: "About" },
      { id: 2, name: "Work", sectionId: "Work" },
      { id: 3, name: "Contact", sectionId: "Contact" },
    ],
    [],
  );

  const sectionIds = useMemo(() => navItems.map((i) => i.sectionId), [navItems]);
  const activeSectionId = useScrollSpy(sectionIds);

  useEffect(() => {
    if (!activeSectionId) return;
    const activeIndex = navItems.findIndex((item) => item.sectionId === activeSectionId);
    if (activeIndex !== -1) setActiveId(activeIndex);
  }, [activeSectionId, navItems]);

  const handleNavClick = useCallback(
    (item: (typeof navItems)[number]) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault(); // keep URL clean (no #hash)
      setActiveId(item.id);
      setIsMenuOpen(false);
      scrollToSection(item.sectionId);
    },
    [],
  );

  const navItemsMapped = navItems.map((item) => (
    <NavBarItem
      key={item.id}
      id={item.id}
      href={`#${item.sectionId}`}
      activeId={activeId}
      onClick={handleNavClick(item)}
    >
      {item.name}
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
        <DarkModeToggle />
        <SettingsMenu />
      </div>
    </div>
  );
};
