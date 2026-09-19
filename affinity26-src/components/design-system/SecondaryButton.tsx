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
}

type SecondaryButtonProps =
  | (CommonProps & { href: string })
  | (CommonProps & { href?: undefined });

/** Phase 22: same `active:` press micro-interaction as GoldButton — see its own doc comment. */
const BASE_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border px-6 py-2.5 font-body text-sm font-semibold uppercase tracking-[0.08em] transition-[background-color,border-color,color,transform] duration-base ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50";

const SECONDARY_CLASS =
  "border-antique-gold/70 bg-transparent text-ivory hover:border-warm-gold hover:bg-antique-gold/10 active:bg-antique-gold/15";

/**
 * Lower-emphasis action — "Back" in the wizard, "Learn More", a modal's
 * dismiss action, anywhere a GoldButton in the same view would create two
 * competing primary actions. Same polymorphic `href`/`button` API and
 * touch-target sizing as GoldButton, so the two are always interchangeable
 * without a layout shift.
 */
export function SecondaryButton({
  children,
  className = "",
  disabled = false,
  type = "button",
  onClick,
  fullWidth = false,
  href,
  ...aria
}: SecondaryButtonProps) {
  const classes = [BASE_CLASS, SECONDARY_CLASS, fullWidth ? "w-full" : "", className]
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
