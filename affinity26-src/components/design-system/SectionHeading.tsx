import type { ReactNode } from "react";
import { GoldDivider } from "./GoldDivider";

export interface SectionHeadingProps {
  /** The small italic line above the title, e.g. "Enter the Story". Design copy, not an official fact — see docs/affinity-content-truth.md for what counts as one. */
  eyebrow?: string;
  title: ReactNode;
  /** Supporting sentence below the title. */
  subtitle?: ReactNode;
  /**
   * Heading level actually rendered (`h1`-`h4`). Callers must pass this
   * explicitly rather than relying on a default, so page-level heading
   * hierarchy stays correct — SectionHeading has no way to know whether
   * it's the page's one `h1` or a later `h2`/`h3`.
   */
  as: "h1" | "h2" | "h3" | "h4";
  align?: "left" | "center";
  /** @default true */
  divider?: boolean;
  className?: string;
  id?: string;
}

/**
 * The recurring "eyebrow / title / divider / subtitle" pattern used to
 * open every major section. Title always renders in the display face
 * (Cinzel) at a size driven by the heading level, so visual hierarchy and
 * document hierarchy can never drift apart.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  as: Tag,
  align = "center",
  divider = true,
  className = "",
  id,
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";

  const sizeClass =
    Tag === "h1"
      ? "text-4xl sm:text-5xl lg:text-6xl"
      : Tag === "h2"
        ? "text-3xl sm:text-4xl lg:text-5xl"
        : Tag === "h3"
          ? "text-2xl sm:text-3xl"
          : "text-xl sm:text-2xl";

  return (
    <div className={["flex flex-col gap-4", alignClass, className].join(" ")}>
      {eyebrow ? (
        <p className="font-accent text-lg italic tracking-wide text-warm-gold sm:text-xl">
          {eyebrow}
        </p>
      ) : null}
      <Tag
        id={id}
        className={["font-display font-semibold tracking-wide text-ivory", sizeClass].join(" ")}
      >
        {title}
      </Tag>
      {divider ? <GoldDivider /> : null}
      {subtitle ? (
        <p className="max-w-2xl font-body text-base text-desert-sand sm:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}
