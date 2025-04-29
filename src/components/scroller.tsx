import useMergedRef from "@react-hook/merged-ref";
import React, { useEffect, useRef, useState } from "react";

import { cn } from "~/lib/utils";

/**
 * This component is a WIP - I might not end up using it. It's meant to create a
 * nice blur to entice users to scroll up or down to see content above or below.
 */

export const Scroller = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...properties }, reference) => {
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const containerReference = useRef<HTMLDivElement>(null);
  const topSentinelReference = useRef<HTMLDivElement>(null);
  const bottomSentinelReference = useRef<HTMLDivElement>(null);

  const mergedReference = useMergedRef(reference, containerReference);

  useEffect(() => {
    const container = containerReference.current;
    const topSentinel = topSentinelReference.current;
    const bottomSentinel = bottomSentinelReference.current;

    if (!container || !topSentinel || !bottomSentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === topSentinel) {
            setIsAtTop(entry.isIntersecting);
          } else if (entry.target === bottomSentinel) {
            setIsAtBottom(entry.isIntersecting);
          }
        }
      },
      { root: container, threshold: 0.1 },
    );

    observer.observe(topSentinel);
    observer.observe(bottomSentinel);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "overflow-y-auto",
        "data-[is-at-bottom=false]:mask-b-from-80%",
        "data-[is-at-top=false]:mask-t-from-80%",
        className,
      )}
      data-is-at-bottom={isAtBottom}
      data-is-at-top={isAtTop}
      ref={mergedReference}
      {...properties}
    >
      <div data-sentinel="top" ref={topSentinelReference} />
      {properties.children}
      <div data-sentinel="bottom" ref={bottomSentinelReference} />
    </div>
  );
});

Scroller.displayName = "Scroller";
