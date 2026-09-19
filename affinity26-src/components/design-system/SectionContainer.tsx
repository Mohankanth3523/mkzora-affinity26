import type { ElementType, ReactNode } from "react";

type ContainerWidth = "narrow" | "content" | "wide";

export interface SectionContainerProps {
  children: ReactNode;
  /** @default "content" — see styles/tokens.ts `containerWidths` for what each maps to. */
  width?: ContainerWidth;
  /**
   * Rendered tag. Defaults to `section` because most uses are a page
   * section; pass `"div"` for a nested container that shouldn't add
   * another landmark, or `"header"`/`"footer"` where semantically correct.
   */
  as?: ElementType;
  /** Passed through to the root element — use for `aria-labelledby`, `id`, etc. */
  id?: string;
  className?: string;
  /**
   * Vertical rhythm between sections. Off by default so nested containers
   * (e.g. a `div` inside a `section` that already has padding) don't
   * double up.
   */
  verticalPadding?: boolean;
}

const WIDTH_CLASS: Record<ContainerWidth, string> = {
  narrow: "max-w-narrow",
  content: "max-w-content",
  wide: "max-w-wide",
};

/**
 * The one place page width, horizontal gutters, and section-to-section
 * rhythm are decided. Every page section should be built as
 * `<SectionContainer as="section">...</SectionContainer>` rather than a
 * one-off `<div className="max-w-...">` so that rhythm can be tuned in one
 * place later.
 *
 * Horizontal padding is deliberately generous and fixed (not shrinking to
 * near-zero on mobile) — see the project brief's responsive-design
 * requirement to give mobile "its own thoughtful composition," not a
 * squeezed desktop layout.
 */
export function SectionContainer({
  children,
  width = "content",
  as: Tag = "section",
  id,
  className = "",
  verticalPadding = false,
}: SectionContainerProps) {
  return (
    <Tag
      id={id}
      className={[
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        WIDTH_CLASS[width],
        verticalPadding ? "py-section-xl sm:py-section-2xl" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Tag>
  );
}
