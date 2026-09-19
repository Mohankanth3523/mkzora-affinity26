/**
 * AFFINITY '26 design system — barrel export.
 *
 * Phase 03 deliverable (extended Phase 07 with `ScrollReveal`, Phase 19
 * with `Accordion`): reusable, presentational components only. None of
 * these know about `data/` or the registration wizard's state — that
 * wiring happens when pages/features are actually built. Import from
 * "@/components/design-system" rather than deep-importing individual
 * files. Every component here is a Server Component except
 * `ScrollReveal` (needs `"use client"` for its IntersectionObserver) and
 * `Accordion` (needs it for open/closed panel state) — see each file for
 * why that's safe.
 */
export { SectionContainer } from "./SectionContainer";
export type { SectionContainerProps } from "./SectionContainer";

export { SectionHeading } from "./SectionHeading";
export type { SectionHeadingProps } from "./SectionHeading";

export { GoldDivider } from "./GoldDivider";
export type { GoldDividerProps } from "./GoldDivider";

export { GoldButton } from "./GoldButton";
export { SecondaryButton } from "./SecondaryButton";

export { OrnamentalFrame } from "./OrnamentalFrame";
export type { OrnamentalFrameProps } from "./OrnamentalFrame";

export { EventBadge } from "./EventBadge";

export { StarField } from "./StarField";
export type { StarFieldProps } from "./StarField";

export { Lantern } from "./Lantern";
export type { LanternProps } from "./Lantern";

export { Crescent } from "./Crescent";
export type { CrescentProps } from "./Crescent";

export { PalaceSilhouette } from "./PalaceSilhouette";
export type { PalaceSilhouetteProps } from "./PalaceSilhouette";

export { GeometricBand } from "./GeometricBand";
export type { GeometricBandProps } from "./GeometricBand";

export { ScrollReveal } from "./ScrollReveal";
export type { ScrollRevealProps } from "./ScrollReveal";

export { Accordion } from "./Accordion";
export type { AccordionProps, AccordionItemData } from "./Accordion";

export { BrandLogo } from "./BrandLogo";
export type { BrandLogoProps } from "./BrandLogo";
