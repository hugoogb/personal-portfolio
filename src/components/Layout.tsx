import { SpeedInsights } from "@vercel/speed-insights/react";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Header } from "@/components/header/Header";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { ColorContextValue } from "@/types/common.types";
import { STORAGE_KEYS } from "@/constants/strings.constants";
import { ColorContext } from "@/contexts/color.context";
import { animate } from "motion/react";
import { SideNav } from "@/components/shared/SideNav";
import { DEFAULT_COLOR } from "@/constants/colors.constants";
import { useScrollSpy } from "@/hooks/useScrollSpy";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [color, setColor] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.COLOR) || DEFAULT_COLOR;
    }
    return DEFAULT_COLOR;
  });

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const mainRef = useRef<HTMLElement>(null);
  const isScrollingManually = useRef(false);
  const sectionIds = useMemo(() => ["Home", "About", "Projects", "Contact"], []);

  const activeId = useScrollSpy(sectionIds);

  const handleColorChange = useCallback((newColor: string) => {
    setColor(newColor);
    localStorage.setItem(STORAGE_KEYS.COLOR, newColor);
  }, []);

  const colorContextValue = useMemo<ColorContextValue>(
    () => ({
      color,
      setColor: handleColorChange,
    }),
    [color, handleColorChange],
  );

  // Sync primary color with CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty("--primary-color", color);
  }, [color]);

  // Sync active section index from ScrollSpy ID
  useEffect(() => {
    if (!activeId || isScrollingManually.current) return;
    const index = sectionIds.indexOf(activeId);
    if (index !== -1) {
      setActiveSectionIndex(index);
    }
  }, [activeId, sectionIds]);

  const scrollToSection = useCallback(
    (index: number) => {
      const main = mainRef.current;
      if (!main) return;

      const targetId = sectionIds[index];
      const element = document.getElementById(targetId);

      if (element) {
        isScrollingManually.current = true;
        setActiveSectionIndex(index);

        // Use motion's animate for a spring-based scroll
        animate(main.scrollTop, element.offsetTop, {
          type: "spring",
          stiffness: 100,
          damping: 20,
          mass: 1,
          onUpdate: (latest) => {
            main.scrollTop = latest;
          },
          onComplete: () => {
            // Wait for bounce to finish before allowing more scrolljacking
            setTimeout(() => {
              isScrollingManually.current = false;
            }, 400);
          },
        });
      }
    },
    [sectionIds],
  );

  const handleScrollAction = useCallback(
    (direction: 1 | -1) => {
      const nextIndex = Math.max(
        0,
        Math.min(sectionIds.length - 1, activeSectionIndex + direction),
      );
      if (nextIndex !== activeSectionIndex) {
        scrollToSection(nextIndex);
      }
    },
    [activeSectionIndex, sectionIds, scrollToSection],
  );

  // Handle wheel and touch
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const onWheel = (e: WheelEvent) => {
      // If we are currently in the middle of a manual jump animation
      if (isScrollingManually.current) {
        e.preventDefault();
        return;
      }

      // Ignore very small scrolls
      if (Math.abs(e.deltaY) < 20) return;

      const currentEl = document.getElementById(sectionIds[activeSectionIndex]);
      if (currentEl) {
        const viewportHeight = main.clientHeight;
        const isTall = currentEl.scrollHeight > viewportHeight + 20;

        if (isTall) {
          const isAtBottom =
            main.scrollTop + viewportHeight >= currentEl.offsetTop + currentEl.scrollHeight - 10;
          const isAtTop = main.scrollTop <= currentEl.offsetTop + 10;

          // If scrolling down and not at the bottom of current section, let it scroll naturally
          if (e.deltaY > 0 && !isAtBottom) return;
          // If scrolling up and not at the top of current section, let it scroll naturally
          if (e.deltaY < 0 && !isAtTop) return;
        }
      }

      // If we are at a boundary or the section is small, trigger the jump
      e.preventDefault();
      handleScrollAction(e.deltaY > 0 ? 1 : -1);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        handleScrollAction(1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        handleScrollAction(-1);
      } else if (e.key === "Home") {
        e.preventDefault();
        scrollToSection(0);
      } else if (e.key === "End") {
        e.preventDefault();
        scrollToSection(sectionIds.length - 1);
      }
    };

    // Wheel listener (desktop)
    main.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      main.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleScrollAction, scrollToSection, sectionIds, activeSectionIndex]);

  return (
    <>
      <SpeedInsights route="/" />
      <ColorContext.Provider value={colorContextValue}>
        <div className="relative h-dvh overflow-hidden bg-background">
          <Header />

          <SideNav
            sectionIds={sectionIds}
            activeSection={activeSectionIndex}
            scrollToSection={scrollToSection}
            activeColor={color}
          />

          <main
            ref={mainRef}
            className="h-full overflow-y-auto no-scrollbar snap-y snap-mandatory md:snap-none md:scroll-auto scroll-smooth"
          >
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </div>
      </ColorContext.Provider>
    </>
  );
};
