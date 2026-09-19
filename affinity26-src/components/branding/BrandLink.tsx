import type { ReactNode } from "react";

export interface BrandLinkProps {
  /** The mark's `href` from data/branding.ts. When undefined the children render unlinked. */
  href?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a brand mark in a real link when it has an `href`.
 *
 * Deliberately a plain `<a>`, NOT `next/link`: MKZORA's home is the domain root (https://mkzora.com/), outside this
 * app's `/affinity26` basePath, and `next/link` would rewrite "/" to "/affinity26/". Absolute http(s) URLs open in a
 * new tab; the root-relative MKZORA home link stays in the same tab.
 */
export function BrandLink({ href, children, className = "" }: BrandLinkProps) {
  if (!href) return <>{children}</>;
  const external = /^https?:\/\//i.test(href);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={[
        "inline-flex rounded-md transition-opacity duration-fast hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-warm-gold",
        className,
      ].join(" ")}
    >
      {children}
    </a>
  );
}
