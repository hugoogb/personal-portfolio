import { useEffect, useRef, useState } from "react";

export function useScrollSpy(ids: string[]) {
  const [activeId, setActiveId] = useState<string>("");
  const activeIdRef = useRef<string>("");

  useEffect(() => {
    const observerOptions = {
      root: null, // use viewport
      rootMargin: "0px",
      threshold: 0.5, // trigger when 50% of section is visible
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      // Prefer the most visible intersecting section (prevents rapid toggling)
      const best = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      const id = best?.target.getAttribute("id");
      if (!id || activeIdRef.current === id) return;

      activeIdRef.current = id;
      setActiveId(id);
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const observedIds = new Set<string>();

    const tryObserve = () => {
      let didObserve = false;
      ids.forEach((id) => {
        if (observedIds.has(id)) return;
        const element = document.getElementById(id);
        if (!element) return;
        observer.observe(element);
        observedIds.add(id);
        didObserve = true;
      });
      return didObserve;
    };

    // Observe what's already mounted (Home), then pick up lazy-mounted sections (About/Projects).
    tryObserve();

    let mutationObserver: MutationObserver | null = null;
    if (observedIds.size < ids.length) {
      mutationObserver = new MutationObserver(() => {
        const didObserve = tryObserve();
        if (didObserve && observedIds.size === ids.length) {
          mutationObserver?.disconnect();
          mutationObserver = null;
        }
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      mutationObserver?.disconnect();
      observer.disconnect();
    };
  }, [ids]);

  return activeId;
}
