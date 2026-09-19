"use client";

import { useId, useState, type ReactNode } from "react";

export interface AccordionItemData {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItemData[];
  /** Item ids that start expanded. @default [] — every panel starts collapsed. */
  defaultOpenIds?: string[];
  /**
   * Whether more than one panel can be open at once.
   * @default true — a rules/FAQ-style list where panels are independent,
   * not a single-select tab set. Pass `false` for a true one-at-a-time
   * accordion.
   */
  allowMultiple?: boolean;
  /**
   * Lay panels out in a two-column editorial grid from `lg` up (still one
   * column below that). @default false
   */
  twoColumn?: boolean;
  /**
   * Heading level rendered for each item's own `<button>` wrapper — pass
   * whatever keeps document heading order correct given what's above the
   * accordion on the page. @default "h3". The Rules page passes `"h2"`
   * since its accordion sits directly under the page's own `h1` with no
   * intermediate section heading.
   */
  headingLevel?: "h2" | "h3" | "h4";
  className?: string;
}

/** Hand-drawn chevron, rotated open/closed — no icon-library dependency. */
function ChevronGlyph({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={[
        "h-4 w-4 shrink-0 text-antique-gold transition-transform duration-base ease-ornamental motion-reduce:transition-none",
        open ? "rotate-180" : "rotate-0",
      ].join(" ")}
    >
      <path
        d="M3 6 L8 11 L13 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Royal-registry accordion: a plain `<button aria-expanded>` heading per
 * item (native keyboard support — Tab/Enter/Space need nothing extra)
 * driving a `role="region"` panel. Collapse/expand animates via a
 * `grid-template-rows` 0fr/1fr transition (so `height: auto` content can
 * still animate smoothly) rather than `display: none`, which can't
 * transition — panel content stays in the DOM either way (there's nothing
 * focusable inside these panels in current usage) and is marked
 * `aria-hidden` while collapsed so assistive tech skips it. Respects
 * `prefers-reduced-motion` via Tailwind's `motion-reduce:` variant on the
 * transition itself, not by removing the collapse.
 *
 * No accompanying "expand all" control and no single-open constraint by
 * default — see `allowMultiple`. Used by the Rules page ("Laws of the
 * Realm"); generic enough to reuse for Contact FAQs or similar later.
 */
export function Accordion({
  items,
  defaultOpenIds = [],
  allowMultiple = true,
  twoColumn = false,
  headingLevel: HeadingTag = "h3",
  className = "",
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(defaultOpenIds));
  const baseId = useId();

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = allowMultiple ? new Set(prev) : new Set<string>();
      if (prev.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div
      className={[
        "grid grid-cols-1 gap-x-12",
        twoColumn ? "lg:grid-cols-2" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        const headingId = `${baseId}-${item.id}-heading`;
        const panelId = `${baseId}-${item.id}-panel`;

        return (
          <div key={item.id} className="h-fit border-b border-antique-gold/20">
            <HeadingTag className="font-display">
              <button
                type="button"
                id={headingId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex min-h-11 w-full items-center justify-between gap-4 py-4 text-left text-lg font-semibold tracking-wide text-ivory transition-colors duration-fast hover:text-warm-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warm-gold"
              >
                <span>{item.title}</span>
                <ChevronGlyph open={isOpen} />
              </button>
            </HeadingTag>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headingId}
              aria-hidden={!isOpen}
              className="grid transition-[grid-template-rows] duration-base ease-ornamental motion-reduce:transition-none"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="pb-5 font-body text-sm text-desert-sand sm:text-base">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
