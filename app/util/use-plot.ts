import { useEffect, useRef, type DependencyList, type RefObject } from "react";

/**
 * Build an Observable Plot and mount it in the returned container <div>.
 * `build` runs whenever `deps` change and may return null to skip rendering
 * (e.g. no data yet); the previous plot is removed on cleanup.
 */
export function usePlot(
  build: () => (SVGSVGElement | HTMLElement) | null,
  deps: DependencyList,
): RefObject<HTMLDivElement | null> {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current === null) {
      return;
    }
    const plot = build();
    if (plot === null) {
      return;
    }
    // @ts-expect-error TS2345: Cloudflare Workers types shadow the DOM's
    // ParentNode.append() in this tsconfig.
    containerRef.current.append(plot);
    return () => {
      plot.remove();
    };
    // The caller's deps stand in for `build`, a fresh closure every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
}
