import type { Metadata } from "next";

/**
 * AFFINITY '26 SEO metadata — one place for the site-wide values and for the per-page helper.
 *
 * Everything social crawlers read (canonical, og:url, og:image, twitter:image) is an ABSOLUTE https://mkzora.com/...
 * URL, because AFFINITY is served under the /affinity26 sub-path and crawlers do not resolve relative paths against
 * that. The OG image file is public/og/affinity26-og.jpg, which the Next.js export copies to
 * dist/affinity26/og/affinity26-og.jpg.
 */
export const SITE_ORIGIN = "https://mkzora.com";
export const SITE_URL = `${SITE_ORIGIN}/affinity26/`;
export const OG_IMAGE_URL = `${SITE_URL}og/affinity26-og.jpg`;

export const SITE_TITLE = "AFFINITY '26 — 11th Edition | Karpaga Vinayaga";
export const SOCIAL_TITLE = "AFFINITY '26 — 11th Edition";
export const SITE_DESCRIPTION =
  "AFFINITY '26 — 11th edition inter-medical collegiate fest by Dhruvaas at Karpaga Vinayaga Institute of Medical Sciences & Research Centre, October 1–3, 2026.";

const OG_IMAGE_ALT =
  "AFFINITY '26 — 11th Edition, 1, 2 & 3 October 2026. Karpaga Vinayaga Educational Group, Dhruvaas, Digital Partner MKZORA, Event by Garudan Nexus.";

/** Sitewide defaults, used by app/layout.tsx. */
export function siteMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    alternates: { canonical: SITE_URL },
    robots: { index: true, follow: true },
    icons: {
      icon: [
        { url: `${SITE_URL}favicon.ico`, sizes: "any" },
        { url: `${SITE_URL}favicon-32x32.png`, type: "image/png", sizes: "32x32" },
        { url: `${SITE_URL}favicon-192x192.png`, type: "image/png", sizes: "192x192" },
      ],
      apple: [{ url: `${SITE_URL}apple-touch-icon.png`, sizes: "180x180" }],
    },
    openGraph: {
      type: "website",
      url: SITE_URL,
      siteName: "AFFINITY '26",
      title: SOCIAL_TITLE,
      description: SITE_DESCRIPTION,
      locale: "en_IN",
      images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, type: "image/jpeg", alt: OG_IMAGE_ALT }],
    },
    twitter: {
      card: "summary_large_image",
      title: SOCIAL_TITLE,
      description: SITE_DESCRIPTION,
      images: [{ url: OG_IMAGE_URL, alt: OG_IMAGE_ALT }],
    },
  };
}

/**
 * Per-page metadata. Next.js replaces (not merges) `openGraph`/`alternates` when a page sets them, so a page that only
 * set `title` would inherit the HOME page's canonical and og:url. This helper gives each page its own canonical and
 * og:url while repeating the shared image.
 *
 * @param path route below /affinity26, WITH leading and trailing slash, e.g. "/events/".
 */
export function pageMetadata(opts: { title: string; path: string; description?: string }): Metadata {
  const url = `${SITE_ORIGIN}/affinity26${opts.path}`;
  const description = opts.description ?? SITE_DESCRIPTION;
  return {
    title: opts.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: "AFFINITY '26",
      title: opts.title,
      description,
      locale: "en_IN",
      images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, type: "image/jpeg", alt: OG_IMAGE_ALT }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description,
      images: [{ url: OG_IMAGE_URL, alt: OG_IMAGE_ALT }],
    },
  };
}
