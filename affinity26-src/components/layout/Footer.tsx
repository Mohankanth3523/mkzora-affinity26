import Link from "next/link";
import { BrandLogo, Crescent, GoldDivider, PalaceSilhouette, SectionContainer, StarField } from "@/components/design-system";
import { festivalIdentity } from "@/data/content";
import { siteBranding, type DigitalPartner } from "@/data/branding";
import { BrandLink } from "@/components/branding/BrandLink";
import { LocationButton } from "@/components/location/LocationButton";
import { generalWhatsApp, instagramHandle } from "@/data/contacts";
import { toWhatsAppHref, toInstagramHref } from "@/lib/contact/contactLinks";
import { ChatGlyph, CameraGlyph } from "@/components/contact/ContactIcons";

const QUICK_LINKS = [
  { href: "/events", label: "Events" },
  { href: "/rules", label: "Rules" },
  { href: "/register", label: "Registration" },
  { href: "/contact", label: "Contact" },
] as const;

const FOOTER_LINK_CLASS =
  "group inline-flex min-h-11 items-center gap-2.5 font-body text-sm text-ivory/90 underline decoration-transparent underline-offset-4 transition-colors duration-fast hover:text-warm-gold hover:decoration-warm-gold/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warm-gold sm:min-h-0";

const FOOTER_LABEL_CLASS = "font-body text-xs font-semibold uppercase tracking-[0.14em] text-desert-sand";

/** Small gold tick under each column label — a quiet signature accent (not a full GoldDivider, which is built to be centered) so the three column headers read as deliberately set, not just bold text. */
function ColumnAccent() {
  return <span aria-hidden="true" className="block h-px w-8 bg-antique-gold/50" />;
}

/** The same gold-dot bullet `EventDetailsModal`/`RulesContent` use for list items, reused here so the Quick Links column reads as a designed list rather than a plain link stack. */
function LinkDot() {
  return (
    <span
      aria-hidden="true"
      className="h-1 w-1 shrink-0 rounded-full bg-antique-gold/70 transition-colors duration-fast group-hover:bg-warm-gold"
    />
  );
}

/**
 * Phase 20 — "The Story Continues." Three compact columns (brand,
 * Quick Links, Social) plus one closing line, replacing the Phase 02
 * placeholder. Deliberately narrow in scope: brand identity + navigation
 * + the two verified social/contact channels — nothing here repeats the
 * full Organising Secretaries/Registration Desk phone lists that
 * `/contact` already owns (see `docs/phase-20-contact-footer-notes.md`),
 * which is what keeps this "elegant and compact" rather than a second
 * contact page bolted under every route.
 *
 * Phase 27: a visual-only pass (no new links, no new facts) to give the
 * footer the same atmosphere every other section already has — it was
 * the one remaining part of the site sitting on a flat, near-transparent
 * background with no texture at all. Now a solid `royal-navy` band (not
 * a translucent one bleeding into the page above it) carries a static
 * `StarField` and a low-opacity `PalaceSilhouette` skyline along its top
 * edge — the same night-sky/palace motif `Hero`/`Theme`/`Cause` already
 * use, reused rather than a new asset, and static (`StarField
 * animated={false}`) since a footer is the one place on the page a
 * viewer lingers to read fine print, where ambient motion would be
 * distracting rather than atmospheric. One of the two verified
 * `festivalIdentity.taglines` now appears as a small attributed quote in
 * the brand column — already-sourced copy, not a new claim.
 *
 * Phase 29: a very small, compact digital-partners row was added to the
 * closing colophon (below the divider, beside the existing crest/closing
 * line) — not a fourth grid column, since the three-column layout above
 * is a deliberate institutional/navigation/social split the brief never
 * asked to change.
 *
 * Phase 33: two changes to that colophon, both direct requests from that
 * session. First, the digital-partners row itself grew from Phase 29's
 * `h-8 sm:h-9` (deliberately the smallest digital-partner treatment
 * anywhere on the site) to `h-11 sm:h-12` — still visibly smaller than
 * the homepage Digital Partners section's own marks, so the footer stays
 * the "quietest" of the three places partner logos appear, but no longer
 * so small they read as an afterthought. Second, a new, separate
 * "Website powered by MKZORA" line was added below the general Digital
 * Partners row — this is *not* another digital-partner credit; it's a
 * distinct "built by" attribution for one specific partner, in a role
 * "Digital Partner" doesn't capture, using `siteBranding.poweredBy`
 * (kept as its own field in `data/branding.ts`, reusing MKZORA's
 * identity rather than duplicating it — see that file's own comment).
 * Since `Footer` mounts once in the root layout and renders on every
 * route, this one line is what makes MKZORA's "powered by" credit
 * sitewide, without adding a third-party mark to the primary nav or to
 * `RegistrationPass`'s own deliberately logo-free digital-partners line
 * (both left untouched — see those files' own comments for why).
 */
export function Footer() {
  return (
    <footer
      id="site-footer"
      className="relative mt-24 overflow-hidden border-t border-antique-gold/25 bg-royal-navy"
    >
      {/* Atmosphere: same restrained night-sky + palace-horizon motif used elsewhere, kept static so it reads as texture, not a second hero moment. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <StarField animated={false} className="opacity-40" />
        <PalaceSilhouette
          gapColor="#0D1530"
          className="absolute inset-x-0 top-0 h-16 w-full text-antique-gold/[0.14] sm:h-20 lg:h-24"
        />
      </div>

      <SectionContainer as="div" width="wide" className="relative z-10 flex flex-col gap-10 py-12 sm:py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="flex w-fit items-center gap-2 font-display text-xl font-semibold tracking-wide text-ivory transition-colors duration-fast hover:text-warm-gold"
            >
              <Crescent size={24} className="text-warm-gold" />
              <span>
                AFFINITY <span className="text-antique-gold">&rsquo;26</span>
              </span>
            </Link>
            <p className="font-accent text-base italic text-warm-gold">The Story Continues</p>
            <p className="font-body text-xs leading-relaxed text-desert-sand">
              {festivalIdentity.institution}
            </p>
            <p className="font-body text-xs text-desert-sand/70">
              {festivalIdentity.edition} · Presented by the {festivalIdentity.presentedBy}
            </p>
            <p className="font-body text-xs font-semibold uppercase tracking-[0.14em] text-warm-gold">
              <time dateTime={`${festivalIdentity.dates.startISO}/${festivalIdentity.dates.endISO}`}>
                {festivalIdentity.dates.display}
              </time>
            </p>
            <LocationButton variant="link" label="View Event Location" />
            <p className="mt-1 border-l-2 border-antique-gold/40 pl-3 font-accent text-sm italic leading-snug text-desert-sand/90">
              &ldquo;{festivalIdentity.taglines[0]}&rdquo;
            </p>
          </div>

          <nav aria-label="Footer quick links" className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className={FOOTER_LABEL_CLASS}>Quick Links</p>
              <ColumnAccent />
            </div>
            <ul className="flex flex-col gap-1.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={FOOTER_LINK_CLASS}>
                    <LinkDot />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className={FOOTER_LABEL_CLASS}>Social</p>
              <ColumnAccent />
            </div>
            <ul className="flex flex-col gap-1.5">
              <li>
                <a
                  href={toInstagramHref(instagramHandle)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={FOOTER_LINK_CLASS}
                >
                  <CameraGlyph className="h-4 w-4 shrink-0 text-antique-gold/70 transition-colors duration-fast group-hover:text-warm-gold" />
                  Instagram
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a
                  href={toWhatsAppHref(generalWhatsApp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={FOOTER_LINK_CLASS}
                >
                  <ChatGlyph className="h-4 w-4 shrink-0 text-antique-gold/70 transition-colors duration-fast group-hover:text-warm-gold" />
                  WhatsApp
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <GoldDivider size="sm" />

        <div className="flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-3">
            <Crescent size={16} className="text-antique-gold/50" />
            <p className="text-center font-body text-xs tracking-wide text-desert-sand/60">
              {festivalIdentity.name} — {festivalIdentity.institution}
            </p>
          </div>

          {siteBranding.digitalPartners.length > 0 ? (
            <div className="flex flex-col items-center gap-2">
              <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-desert-sand/50">
                Digital Partners
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {(siteBranding.digitalPartners as readonly DigitalPartner[]).map((partner) => (
                  <BrandLink key={partner.name} href={partner.href}>
                    <BrandLogo
                      src={partner.logo}
                      alt={partner.alt}
                      heightClassName="h-11 sm:h-12"
                      padding="sm"
                    />
                  </BrandLink>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col items-center gap-2 border-t border-antique-gold/10 pt-5">
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-desert-sand/50">
              Website Powered By
            </p>
            <BrandLink href={siteBranding.poweredBy.href}>
              <BrandLogo
                src={siteBranding.poweredBy.logo}
                alt={siteBranding.poweredBy.alt}
                heightClassName="h-9 sm:h-10"
                padding="sm"
              />
            </BrandLink>
          </div>
        </div>
      </SectionContainer>
    </footer>
  );
}
