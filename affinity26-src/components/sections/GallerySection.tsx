import { SectionContainer, SectionHeading } from "@/components/design-system";
import { Gallery } from "@/components/gallery/Gallery";
import { galleryImages } from "@/data/gallery";

/**
 * Phase 32 — the landing page's Gallery section, mounted between
 * `EventsTeaser` and `DigitalPartnersSection` (see `app/page.tsx`): a
 * "look at the energy" moment right after the events pitch, ahead of the
 * closing partners/footer sequence. Uses the same
 * `SectionContainer`/`SectionHeading` pattern every other landing
 * section already uses (`EventsTeaser`, `DigitalPartnersSection`).
 *
 * "Moments That Became Tales" and its subtitle are design copy — see
 * docs/affinity-content-truth.md's own eyebrow/heading conventions —
 * deliberately not naming a specific edition or date, since the supplied
 * photographs carry no such metadata and this project's TRUTH MODE rule
 * governs design copy too ("never make invented claims sound like
 * official facts").
 *
 * Renders nothing if `galleryImages` is ever emptied out, the same
 * defensive pattern `DigitalPartnersSection` already uses for
 * `siteBranding.digitalPartners`.
 */
export function GallerySection() {
  if (galleryImages.length === 0) return null;

  return (
    <section aria-labelledby="gallery-heading" className="relative overflow-hidden">
      <SectionContainer as="div" width="wide" verticalPadding className="relative z-10">
        <SectionHeading
          as="h2"
          id="gallery-heading"
          eyebrow="Glimpses"
          title="Moments That Became Tales"
          subtitle="A look at the energy, the courts, and the company AFFINITY brings together."
        />

        <div className="mt-10 sm:mt-12">
          <Gallery images={galleryImages} />
        </div>
      </SectionContainer>
    </section>
  );
}
