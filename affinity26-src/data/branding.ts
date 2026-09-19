/**
 * AFFINITY '26 brand asset registry — single source of truth for every
 * logo path, brand name, and accessible alt text used anywhere in the
 * app. Nothing outside this file should hold a literal path into
 * `public/assets/logo/`, mirroring the same centralization discipline
 * `data/content.ts`/`data/events/` already apply to factual copy.
 *
 * All five files under `public/assets/logo/` are the official artwork
 * supplied for this project, re-encoded (via `sharp`, losslessly resized
 * where a source exceeded 1400px on its long edge — see
 * docs/phase-33-logo-refresh-notes.md) but never recolored, cropped, or
 * redrawn. `BrandLogo` (components/design-system/BrandLogo.tsx) is the
 * only component that renders them, always at `width: auto` against a
 * caller-chosen height, so the original aspect ratio is preserved
 * everywhere they appear.
 *
 * Phase 33 replaced all five files with newer, higher-resolution versions
 * supplied directly in that session's request, and — unlike the Phase 29
 * originals — every one of these five is a genuinely transparent PNG (no
 * baked-in white background), verified by sampling each file's corner
 * pixels before this file was written. `BrandLogo`'s ivory "plaque" frame
 * still applies by default: it isn't compensating for a white background
 * anymore, but it's kept because it's this site's own established
 * "royal seal" presentation for a brand mark, not a workaround.
 *
 * Alt text below follows the phase brief's own worked examples verbatim
 * in spirit ("College logo: full institution name", "Digital partner:
 * '<Name> — Digital Partner'") — never a filename, never "logo.png".
 */

/**
 * MKZORA's own site is the domain root (https://mkzora.com/), while AFFINITY '26 is served under /affinity26/.
 * `next/link` (and `router.push`) would prefix this with the basePath and send visitors to
 * https://mkzora.com/affinity26/ — the wrong place — so every MKZORA link renders a PLAIN `<a href>` with this
 * root-relative value. On the production origin it resolves to exactly https://mkzora.com/ (and it also works on
 * localhost / *.pages.dev previews, which an absolute https://mkzora.com/ would not). Never pass it to
 * `next/link`, and never run it through `assetPath()`.
 */
export const MKZORA_HOME_HREF = "/";

export interface BrandMark {
  /** Optional link target. Only MKZORA's marks set it (see MKZORA_HOME_HREF); rendered with a plain <a>, never next/link. */
  href?: string;
  /** Display name for this brand — used in alt text and, where relevant, as a visible label. */
  name: string;
  /** Path under `public/`, e.g. "/assets/logo/college-logo.png". */
  logo: string;
  /** Full accessible alt text for this specific mark. */
  alt: string;
}

export interface DigitalPartner extends BrandMark {
  /**
   * Official partner URL, if one was supplied. No official website URL
   * was provided for either digital partner in this phase — per the
   * brief's own instruction ("Do not invent website URLs... leave links
   * disabled rather than guessing"), this is intentionally left
   * `undefined` for both entries below rather than filled with a guess.
   * `DigitalPartners` only renders an `<a>` wrapper when this is set.
   */
  href?: string;
}

/**
 * MKZORA's mark, name, and asset path — defined once and reused by both
 * `digitalPartners` (where it appears alongside Garudan Nexus, equally
 * sized, per the existing Digital Partners hierarchy) and `poweredBy`
 * (the separate, sitewide "Website powered by MKZORA" credit Phase 33
 * added to the global `Footer`). Kept as one object rather than two
 * separate literals so the name/logo/alt can never quietly drift apart
 * between the two places MKZORA is credited.
 */
const mkzoraMark: BrandMark = {
  name: "MKZORA",
  logo: "/assets/logo/mkzora-logo.png",
  alt: "MKZORA — Digital Partner",
  href: MKZORA_HOME_HREF,
};

/**
 * Brand hierarchy, exactly as specified by the phase brief:
 *  - `event` (AFFINITY '26 itself) is PRIMARY — always the largest/most
 *    prominent mark wherever more than one brand appears together.
 *  - `college` and `batch` are secondary/organisational — smaller than
 *    `event`, but they get equal treatment with each other.
 *  - `digitalPartners` are tertiary and always equal to each other —
 *    never larger than, or visually competing with, `event`.
 *  - `poweredBy` (Phase 33) is a separate, single, sitewide credit — not
 *    part of the "equal digital partners" set above, since it names one
 *    specific partner (MKZORA) in one specific, deliberately understated
 *    role ("this website is powered by"), the same way a "Built with X"
 *    line works on other sites. It reuses `mkzoraMark`'s own identity
 *    rather than duplicating it, so MKZORA is still, in substance, listed
 *    once — just rendered in two different places for two different
 *    reasons.
 * Sizing itself lives at each call site (Tailwind height classes), not
 * here — this file only fixes identity (which logo, what it's called,
 * what its alt text is), never presentation.
 */
export const siteBranding = {
  college: {
    name: "Karpaga Vinayaga Institute of Medical Sciences and Research Centre",
    logo: "/assets/logo/college-logo.png",
    alt: "Karpaga Vinayaga Institute of Medical Sciences and Research Centre — college logo",
  },
  event: {
    name: "AFFINITY '26",
    logo: "/assets/logo/affinity-event-logo.png",
    alt: "AFFINITY '26 — 11th edition official event emblem",
  },
  batch: {
    name: "Dhruvaas batch",
    logo: "/assets/logo/dhruvaas-batch-logo.png",
    alt: "Dhruvaas batch — organising batch logo",
  },
  digitalPartners: [
    mkzoraMark,
    {
      name: "Garudan Nexus",
      logo: "/assets/logo/garudan-nexus-logo.png",
      alt: "Garudan Nexus — Digital Partner",
    },
  ],
  poweredBy: {
    name: mkzoraMark.name,
    logo: mkzoraMark.logo,
    alt: "MKZORA — this website is designed and powered by MKZORA",
    href: MKZORA_HOME_HREF,
  },
} as const satisfies {
  college: BrandMark;
  event: BrandMark;
  batch: BrandMark;
  digitalPartners: readonly DigitalPartner[];
  poweredBy: BrandMark;
};
