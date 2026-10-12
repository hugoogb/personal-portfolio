import type { Page } from "@playwright/test";

export type PageMetrics = { lcpTag: string; lcpUrl: string; cls: number; shifts: string[] };

/**
 * Reads the largest contentful paint and the layout shift total the page has
 * recorded so far. A text node has no element of its own, so the LCP tag falls
 * back to its parent; an image LCP carries a non-empty url.
 */
export const pageMetrics = (page: Page): Promise<PageMetrics> =>
  page.evaluate(
    () =>
      new Promise<PageMetrics>((resolve) => {
        let lcpTag = "";
        let lcpUrl = "";
        let cls = 0;
        const shifts: string[] = [];
        new PerformanceObserver((list) => {
          const last = list.getEntries().at(-1) as PerformanceEntry & {
            element?: Element | null;
            url?: string;
          };
          lcpTag = last?.element?.tagName ?? "";
          lcpUrl = last?.url ?? "";
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as (PerformanceEntry & {
            value: number;
            hadRecentInput: boolean;
            sources?: { node?: Node | null }[];
          })[]) {
            if (e.hadRecentInput) continue;
            cls += e.value;
            for (const s of e.sources ?? [])
              shifts.push(
                `${s.node?.nodeName}:${(s.node?.textContent ?? "").slice(0, 30)}:${(s.node as Element | null)?.className ?? s.node?.parentElement?.className}`,
              );
          }
        }).observe({ type: "layout-shift", buffered: true });
        setTimeout(() => resolve({ lcpTag, lcpUrl, cls, shifts }), 1500);
      }),
  );
