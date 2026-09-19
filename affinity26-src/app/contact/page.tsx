import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SectionContainer, SectionHeading } from "@/components/design-system";
import { ContactContent } from "@/components/contact/ContactContent";

export const metadata: Metadata = pageMetadata({
  title: "The Royal Herald — Contact — AFFINITY '26",
  path: "/contact/",
});

/**
 * Phase 20 — the real Contact page ("The Royal Herald"). A Server
 * Component: `data/contacts.ts` is static, so nothing here needs client
 * state — `ContactContent` just renders it.
 *
 * Organized under the brief's four named categories (Organising
 * Secretaries, Registration Desk, Registration WhatsApp, Instagram) —
 * see `ContactContent`'s own doc comment for why `data/contacts.ts`'s
 * other four verified groups aren't rendered here.
 */
export default function ContactPage() {
  return (
    <SectionContainer as="section" verticalPadding className="flex flex-col gap-10 sm:gap-12">
      <SectionHeading
        as="h1"
        eyebrow="AFFINITY '26 · Contact"
        title="The Royal Herald"
        subtitle="Verified organizer contacts only — every number, WhatsApp, and handle below is exactly as published by AFFINITY '26."
      />
      <ContactContent />
    </SectionContainer>
  );
}
