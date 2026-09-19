import type { ReactNode } from "react";
import Link from "next/link";

interface CommonProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  "aria-label"?: string;
  fullWidth?: boolean;
  /**
   * Native HTML form association — lets this button submit a `<form>`
   * elsewhere in the tree (e.g. `RegistrationNavigation`'s "Next" driving
   * `ParticipantStep`'s own form/validation, Phase 12) without the two
   * components needing a shared ref or lifted state. Only meaningful with
   * `type="submit"`.
   */
  form?: string;
}

type GoldButtonProps =
  | (CommonProps & { href: string })
  | (CommonProps & { href?: undefined });

/**
 * Shared visual treatment for GoldButton/SecondaryButton — solid gold
 * fill, sharp-cornered (radius comes from the `sm` token, not a pill), a
 * deliberate warm-gold glow on hover/focus rather than a hover scale/lift
 * (the brief calls out over-animated gaming-site interactions to avoid).
 * Phase 22 adds one small `active:` press — a 3% scale-down while the
 * button is held, `transform` only (no layout properties) — as this
 * component's "micro interaction," separate from the hover glow, so a
 * click reads as a tactile press rather than just a color swap.
 * `min-h-11` (44px) keeps the touch target accessible at every
 * breakpoint.
 */
const BASE_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-6 py-2.5 font-body text-sm font-semibold uppercase tracking-[0.08em] transition-[background-color,box-shadow,color,transform] duration-base ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50";

const PRIMARY_CLASS =
  "bg-antique-gold text-midnight hover:bg-warm-gold hover:shadow-gold-glow active:bg-warm-gold";

/**
 * Primary call-to-action button ("Enter the Story", "Begin Registration",
 * step-forward actions in the wizard). Polymorphic: pass `href` to render
 * a Next.js `Link` styled identically, or omit it for a real `<button>`
 * (form submits, wizard "Next", modal triggers).
 */
export function GoldButton({
  children,
  className = "",
  disabled = false,
  type = "button",
  onClick,
  fullWidth = false,
  href,
  form,
  ...aria
}: GoldButtonProps) {
  const classes = [BASE_CLASS, PRIMARY_CLASS, fullWidth ? "w-full" : "", className]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={aria["aria-label"]} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      form={form}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      aria-label={aria["aria-label"]}
      aria-disabled={disabled || undefined}
    >
      {children}
    </button>
  );
}
