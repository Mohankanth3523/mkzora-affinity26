import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SectionContainer, SectionHeading } from "@/components/design-system";
import { RulesContent } from "@/components/rules/RulesContent";

export const metadata: Metadata = pageMetadata({
  title: "Event Rules & Guidelines — AFFINITY '26",
  path: "/rules/",
});

/**
 * Phase 19 — the real Rules page (registration flow simplification phase:
 * retitled from "Laws of the Realm" to "Event Rules & Guidelines," per
 * that phase's explicit instruction to swap this exact fantasy title for
 * professional college-event wording — see
 * docs/phase-36-registration-flow-simplification-notes.md). A Server
 * Component: the actual verified rule text (`data/rules.ts`, regrouped
 * for display by `data/rulesCategories.ts`) never needs client-side
 * state, only the accordion's own open/closed toggling does — that's
 * isolated inside `RulesContent` → `Accordion`.
 *
 * "Desktop: editorial two-column layout where useful. Mobile: accordion"
 * (the brief's own phrasing) is implemented as one `Accordion` whose
 * eleven panels lay out in a two-column CSS grid from `lg` up and stack
 * to one column below that — every panel is still a real, independently
 * collapsible accordion item at every breakpoint, so keyboard/AT
 * behavior never changes across the responsive split, only the reading
 * layout does.
 */
export default function RulesPage() {
  return (
    <SectionContainer as="section" verticalPadding className="flex flex-col gap-10 sm:gap-12">
      <SectionHeading
        as="h1"
        eyebrow="AFFINITY '26 · Rules & Regulations"
        title="Event Rules & Guidelines"
        subtitle="Every clause below is drawn directly from the official AFFINITY '26 brochure and terms & conditions. Where the source documents disagree with each other, that conflict is flagged rather than silently resolved — see the notices under Eligibility and Payment."
      />
      <RulesContent />
    </SectionContainer>
  );
}
