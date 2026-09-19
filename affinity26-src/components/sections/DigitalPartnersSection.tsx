import { SectionContainer, SectionHeading } from "@/components/design-system";
import { DigitalPartners } from "@/components/branding/DigitalPartners";
import { siteBranding } from "@/data/branding";

/**
 * Phase 29 — the dedicated "Digital Partners" section the brief calls
 * for, mounted on the landing page immediately after `EventsTeaser` and
 * before `Footer` (see `app/page.tsx`). Deliberately its own small
 * section rather than folded into the Footer or Hero: the brief is
 * explicit that partner logos must "never compete with the AFFINITY '26
 * logo," and giving them their own quiet, clearly-labelled moment (using
 * the same `SectionHeading`/`SectionContainer` pattern every other
 * landing section already uses) reads as "premium partnership
 * acknowledgement," not a sponsor strip bolted onto a busier section.
 *
 * No "Sponsors" wording anywhere here — the brief's own term, "Digital
 * Partners," is used verbatim, and no sponsorship claim is made since
 * none was supplied in the source documents.
 */
export function DigitalPartnersSection() {
  return (
    <section aria-labelledby="digital-partners-heading" className="relative overflow-hidden">
      <SectionContainer as="div" width="content" verticalPadding className="relative z-10">
        <SectionHeading
          as="h2"
          id="digital-partners-heading"
          eyebrow="With Gratitude"
          title="Digital Partners"
          subtitle="AFFINITY '26 is proud to be supported online by our digital partners."
        />

        <div className="mt-10 sm:mt-12">
          <DigitalPartners partners={siteBranding.digitalPartners} />
        </div>
      </SectionContainer>
    </section>
  );
}
