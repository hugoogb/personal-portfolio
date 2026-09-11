import type { FC, MouseEvent } from "react";
import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { SettingsMenu } from "@/components/header/navbar/SettingsMenu";
import { NavBarItem } from "@/components/header/navbar/NavBarItem";
import { DarkModeToggle } from "@/components/header/navbar/DarkModeToggle";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { SectionNavContext } from "@/contexts/section-nav.context";

export const Navbar: FC = () => {
  const { sectionIds, activeIndex, goToSection } = useContext(SectionNavContext);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const navbarRef = useRef<HTMLUListElement>(null);
  const iconMenuNavbarRef = useRef<HTMLButtonElement>(null);

  const handleNavClick = useCallback(
    (sectionId: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault(); // keep URL clean (no #hash)
      setIsMenuOpen(false);
      goToSection(sectionId);
    },
    [goToSection],
  );

  const navItemsMapped = sectionIds.map((sectionId, index) => (
    <NavBarItem
      key={sectionId}
      id={index}
      href={`#${sectionId}`}
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
        <DarkModeToggle />
        <SettingsMenu />
      </div>
    </div>
  );
};
