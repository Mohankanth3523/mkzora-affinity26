import type { ReactNode } from "react";
import { BrandLogo, SectionContainer } from "@/components/design-system";
import { siteBranding } from "@/data/branding";

export interface RegistrationLayoutProps {
  progress: ReactNode;
  summary: ReactNode;
  children: ReactNode;
}

/**
 * Phase 11: the outer shell for `/register` — heading, then the progress
 * indicator, then a two-column body (step content + nav on the left, the
 * running summary as an aside on the right) that collapses to a single
 * stacked column below `lg`. Natural DOM order already puts the summary
 * after the main column, so mobile stacking needs no reordering classes.
 *
 * Purely presentational — no `useRegistration()` call here. Every piece
 * that needs wizard state (`RegistrationProgress`, `RegistrationSummary`,
 * the step content, `RegistrationNavigation`) is passed in already built,
 * so this component stays reusable even if `/register` ever needed a
 * second entry point with different content in the same shell.
 *
 * Phase 29: a small, compact institutional identity row (College, event
 * emblem, Dhruvaas) sits above the heading, per the brief's "optional
 * compact institutional identity" allowance for this page — kept
 * deliberately quiet so the registration form itself stays the focus,
 * and with no digital-partner logos at all ("do not place all logos
 * around the registration form").
 *
 * Phase 33: raised each mark's height a step (College/Dhruvaas
 * h-9/h-10 → h-11/h-12, event h-10/h-12 → h-12/h-14) per that session's
 * "make it big, clearly visible" request, while keeping the event
 * emblem the largest of the three and keeping this row visibly more
 * compact than the Hero's — this page's own focus is still the form,
 * not the identity row above it.
 */
export function RegistrationLayout({ progress, summary, children }: RegistrationLayoutProps) {
  return (
    <SectionContainer as="div" width="wide" verticalPadding>
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <BrandLogo
            src={siteBranding.college.logo}
            alt={siteBranding.college.alt}
            heightClassName="h-11 sm:h-12"
            padding="sm"
          />
          {/* Event emblem kept modestly larger than College/Dhruvaas even in
              this compact row, so the site-wide "event logo is always the
              most prominent mark" hierarchy rule holds here too — not just
              in the Hero, where the difference is much more dramatic. */}
          <BrandLogo
            src={siteBranding.event.logo}
            alt={siteBranding.event.alt}
            heightClassName="h-12 sm:h-14"
            padding="sm"
          />
          <BrandLogo
            src={siteBranding.batch.logo}
            alt={siteBranding.batch.alt}
            heightClassName="h-11 sm:h-12"
            padding="sm"
          />
        </div>

        <h1 className="mt-2 font-display text-4xl font-semibold tracking-wide text-ivory sm:mt-3 sm:text-5xl lg:text-6xl">
          AFFINITY &apos;26 Registration
        </h1>
        <p className="font-accent text-lg italic text-warm-gold sm:text-xl">
          Complete your registration below.
        </p>
      </div>

      <div className="mt-10 sm:mt-12">{progress}</div>

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <div>{children}</div>
        <div className="lg:mt-8">{summary}</div>
      </div>
    </SectionContainer>
  );
}
