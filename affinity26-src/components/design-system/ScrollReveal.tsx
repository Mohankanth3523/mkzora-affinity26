"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger this element behind others revealing in the same viewport entry. */
  delayMs?: number;
}

/**
 * The one component in `design-system/` that needs `"use client"` — a
 * scroll-triggered fade-up, for sections below the fold (Hero's six-step
 * reveal plays on load instead, since it's always in the first viewport).
 *
 * Deliberately defaults to **visible**, not hidden. The failure mode this
 * avoids: if this defaulted to `opacity-0` and something prevented
 * hydration (JS disabled, a script error upstream), the content would
 * stay invisible forever — a client-only reveal effect must never be the
 * only thing standing between a user and the words on the page. So:
 * server and first client render both show the content; only *after*
 * mounting do we check whether motion is allowed and whether the element
 * is currently off-screen, and hide-then-reveal only in that specific
 * case. Reduced-motion users and anyone whose content loads already
 * in-view never see it move at all.
 */
export function ScrollReveal({ children, className = "", delayMs = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const rect = node.getBoundingClientRect();
    const alreadyInView = rect.top < window.innerHeight && rect.bottom > 0;
    if (alreadyInView) return;

    setVisible(false);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={[
        "transition-[opacity,transform] duration-slow ease-ornamental",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
