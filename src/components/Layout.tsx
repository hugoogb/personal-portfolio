import { SpeedInsights } from "@vercel/speed-insights/react";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Header } from "@/components/header/Header";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { ColorContextValue, SectionNavValue, ThemeContextValue } from "@/types/common.types";
import { STORAGE_KEYS } from "@/constants/strings.constants";
import { ColorContext } from "@/contexts/color.context";
import { SectionNavContext } from "@/contexts/section-nav.context";
import { ThemeContext } from "@/contexts/theme.context";
import { MotionConfig } from "motion/react";
import { SideNav } from "@/components/shared/SideNav";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { DEFAULT_COLOR } from "@/constants/colors.constants";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { useAccentFavicon } from "@/hooks/useAccentFavicon";
import { hashOf, sectionIdFromHash } from "@/utils/sectionHash";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [color, setColor] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.COLOR) || DEFAULT_COLOR;
    }
    return DEFAULT_COLOR;
  });

  // The inline script in index.html has already put the class on <html> before
  // first paint, so read it back rather than deciding again and flashing.
  const [isDark, setIsDark] = useState<boolean>(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const sectionIds = useMemo(() => ["Home", "About", "Work", "Contact"], []);

  const activeId = useScrollSpy(sectionIds);

  /**
   * The page scrolls natively; the nav only ever asks the browser to scroll.
   *
   * The one thing that still needs coordinating is the scrollspy: it watches a
   * band across the middle of the viewport, so during a smooth jump it reports
   * every section the scroll passes through and the nav pill visits each one.
   * A click sets the active section up front and holds the spy off until the
   * scroll settles.
   */
  const isJumping = useRef(false);
  const endJump = useRef<() => void>(() => {});

  useEffect(() => () => endJump.current(), []);

  const toggleDark = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(next));
      return next;
    });
  }, []);

  const handleColorChange = useCallback((newColor: string) => {
    setColor(newColor);
    localStorage.setItem(STORAGE_KEYS.COLOR, newColor);
  }, []);

  const colorContextValue = useMemo<ColorContextValue>(
    () => ({ color, setColor: handleColorChange }),
    [color, handleColorChange],
  );

  const themeContextValue = useMemo<ThemeContextValue>(
    () => ({ isDark, toggleDark }),
    [isDark, toggleDark],
  );

  // Sync primary color with CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty("--primary-color", color);
  }, [color]);

  // ...and into the tab icon and the mobile browser chrome.
  useAccentFavicon(color);

  /** Keeps the address bar honest without pushing history entries. */
  const syncHash = useCallback(
    (index: number) => {
      const next =
        index === 0 ? window.location.pathname + window.location.search : hashOf(sectionIds[index]);
      if (window.location.hash !== (index === 0 ? "" : next)) {
        window.history.replaceState(null, "", next);
      }
    },
    [sectionIds],
  );

  // Sync active section index from ScrollSpy ID
  useEffect(() => {
    if (!activeId || isJumping.current) return;
    const index = sectionIds.indexOf(activeId);
    if (index !== -1) {
      setActiveSectionIndex(index);
      syncHash(index);
    }
  }, [activeId, sectionIds, syncHash]);

  const scrollToSection = useCallback(
    (index: number) => {
      const element = document.getElementById(sectionIds[index]);
      if (!element) return;

      // Cancel any jump still in flight before starting another.
      endJump.current();

      isJumping.current = true;
      setActiveSectionIndex(index);
      syncHash(index);

      // Smoothness comes from `scroll-behavior` on <html>, which the
      // reduced-motion block in globals.css already overrides to `auto`.
      element.scrollIntoView({ block: "start" });

      let timer = 0;
      const release = () => {
        window.clearTimeout(timer);
        window.removeEventListener("scrollend", release);
        endJump.current = () => {};
        isJumping.current = false;
      };
      // `scrollend` releases the spy the moment the browser is done; the
      // timeout covers browsers that do not fire it.
      window.addEventListener("scrollend", release);
      timer = window.setTimeout(release, 1000);
      endJump.current = release;
    },
    [sectionIds, syncHash],
  );

  const goToSection = useCallback(
    (sectionId: string) => {
      const index = sectionIds.indexOf(sectionId);
      if (index !== -1) scrollToSection(index);
    },
    [sectionIds, scrollToSection],
  );

  /**
   * Someone arriving on /#work should land on Work.
   *
   * Scrolling there once is not enough. About, Work and Contact are lazy, and
   * every one of them that commits *above* the target moves it - a single
   * scroll aimed at Work while About is still a one-screen placeholder leaves
   * you short by however much About grew. So keep re-aiming until the section
   * has held still for a few frames, and give up after about three seconds.
   */
  useEffect(() => {
    const target = sectionIdFromHash(window.location.hash, sectionIds);
    if (!target) return;

    // Otherwise the browser restores the previous scroll position on reload and
    // fights the hash it was handed.
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";

    // `block: "start"` parks the section below the fixed header, not at zero.
    const headerOffset =
      parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;

    let frames = 0;
    let stableFrames = 0;
    let raf = 0;

    // Hold the scrollspy off so the URL does not flicker through #about on the
    // way down.
    isJumping.current = true;

    const finish = () => {
      history.scrollRestoration = previousRestoration;
      isJumping.current = false;
    };

    const land = () => {
      const element = document.getElementById(target);

      if (element) {
        if (Math.abs(element.getBoundingClientRect().top - headerOffset) > 2) {
          element.scrollIntoView({ behavior: "auto", block: "start" });
          stableFrames = 0;
        } else if (++stableFrames > 4) {
          setActiveSectionIndex(sectionIds.indexOf(target));
          finish();
          return;
        }
      }

      if (frames++ < 180) {
        raf = requestAnimationFrame(land);
      } else {
        finish();
      }
    };

    land();

    return () => {
      cancelAnimationFrame(raf);
      finish();
    };
  }, [sectionIds]);

  /**
   * `syncHash` uses replaceState, which never fires this - so the only thing
   * that reaches here is someone changing the fragment themselves.
   */
  useEffect(() => {
    const onHashChange = () => {
      const target = sectionIdFromHash(window.location.hash, sectionIds);
      if (target) goToSection(target);
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [sectionIds, goToSection]);

  const sectionNavValue = useMemo<SectionNavValue>(
    () => ({ sectionIds, activeIndex: activeSectionIndex, goToSection }),
    [sectionIds, activeSectionIndex, goToSection],
  );

  return (
    <>
      <SpeedInsights route="/" />
      <MotionConfig reducedMotion="user">
        <ThemeContext.Provider value={themeContextValue}>
          <ColorContext.Provider value={colorContextValue}>
            <SectionNavContext.Provider value={sectionNavValue}>
              <div className="relative bg-background">
                <Header />

                <SideNav
                  sectionIds={sectionIds}
                  activeSection={activeSectionIndex}
                  scrollToSection={scrollToSection}
                  activeColor={color}
                />

                <main>
                  <ErrorBoundary>{children}</ErrorBoundary>
                </main>

                <CommandPalette />
              </div>
            </SectionNavContext.Provider>
          </ColorContext.Provider>
        </ThemeContext.Provider>
      </MotionConfig>
    </>
  );
};
