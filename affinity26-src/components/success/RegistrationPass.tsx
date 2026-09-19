"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useRegistration } from "@/lib/registration/context";
import { getEventById } from "@/data/events";
import { PACKAGES } from "@/data/pricing";
import {
  SectionContainer,
  SectionHeading,
  GoldDivider,
  GoldButton,
  SecondaryButton,
  OrnamentalFrame,
  BrandLogo,
} from "@/components/design-system";
import { siteBranding } from "@/data/branding";
import { assetPath } from "@/lib/basePath";
import { QR_GRID } from "./qrGrid";
import { buildPassMarkup, buildStandaloneHtml, passCss, type PassData } from "./passDocument";

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function QRPlaceholder() {
  const cell = 8;
  const size = QR_GRID.length * cell;
  return (
    <svg
      role="img"
      aria-label="Demo QR placeholder — not a real, scannable code"
      viewBox={`0 0 ${size} ${size}`}
      className="h-32 w-32 shrink-0 text-midnight sm:h-36 sm:w-36"
    >
      <rect x="0" y="0" width={size} height={size} fill="#F7F0DE" />
      {QR_GRID.map((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill="currentColor" />
          ) : null,
        ),
      )}
    </svg>
  );
}

/**
 * Phase 49 — the printed / downloaded pass is a dedicated one-page A4 sheet built by `passDocument.ts` (the single
 * source of truth for both). `PrintablePass` mounts that sheet into <body> through a portal: it is invisible on screen,
 * and when the browser prints, its own print CSS hides everything else (navbar, footer, page content) and shows only
 * the A4 pass. The normal on-screen success page is unchanged.
 */
function PrintablePass({ data }: { data: PassData }) {
  const html = `<style>${passCss("page")}</style>${buildPassMarkup(data, (path) => assetPath(path))}`;
  return createPortal(<div className="ap-root" aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />, document.body);
}

/** Resolves once every logo image of the printable pass has finished loading (so print never shows a half-loaded logo). */
function printableImagesReady(): Promise<void> {
  const images = Array.from(document.querySelectorAll<HTMLImageElement>(".ap-root img"));
  return Promise.all(
    images.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          }),
    ),
  ).then(() => undefined);
}

/** Reads a same-origin logo file into a data: URI so the downloaded pass is fully self-contained (works offline). */
async function logoDataUri(publicPath: string): Promise<string> {
  const url = assetPath(publicPath);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("logo fetch failed");
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return new URL(url, window.location.origin).href; // still works while online
  }
}

/**
 * `/success` — Phase 18, revised Phase 41. A premium AFFINITY '26
 * registration pass concept (project brief's SUCCESS PAGE section),
 * reading confirmation state from `useRegistration()`. This route sits
 * outside `/register/**`, so `app/success/page.tsx` wraps this component
 * in its own `<RegistrationProvider>` rather than relying on
 * `app/register/layout.tsx` — the provider hydrates from the same
 * `localStorage` key (`lib/registration/storage.ts`) regardless of which
 * page mounted it, so the confirmation still shows up correctly here.
 *
 * Every figure on this pass already carries its own truth-mode guarding
 * upstream (Phase 15/16's pricing calculator) — this page only displays
 * what `state` already holds, it adds no new computation.
 *
 * Phase 41: `state.confirmation` is now only ever set after a genuinely
 * confirmed Google Sheets submission (see
 * `lib/registration/submitRegistration.ts` and `ConfirmStep.tsx`), so the
 * old "this is a frontend demo, not a real confirmation" banner and
 * "Demo — Not a Real Pass" card badge were removed — reaching this page
 * with a `confirmation` object now means the registration really was
 * recorded. The banner instead states the one thing that's still true
 * and still worth saying plainly: no payment was processed, because
 * AFFINITY '26 doesn't collect payment online. The QR placeholder is
 * deliberately left exactly as it was — see `QRPlaceholder` above — it
 * genuinely still encodes nothing and verifies nothing, so "Demo QR —
 * verification will be connected later" stays accurate and stays put.
 * This is a precise, TRUTH MODE distinction, not a blanket "everything is
 * real now" pass: the *registration* is real, the *QR/check-in
 * verification system* is not yet built, and the copy says exactly that,
 * nothing more.
 *
 * Phase 29: the decorative pencil-line "crest" glyph that used to sit in
 * the header has been replaced with the real, official AFFINITY '26
 * event emblem (`BrandLogo`, small — matching the glyph's old footprint,
 * not enlarged) — the brief's own success-page section asks for the
 * event's official identity here, not an invented ornament standing in
 * for it. Digital partners get a single small, plain-TEXT line near the
 * bottom (no logo images at all) — the brief is explicit that partner
 * branding must never dominate the registration pass, and a demo pass a
 * participant might screenshot or print is exactly the surface where
 * "dominate" is easiest to accidentally do with two more logo images.
 *
 * Phase 33 deliberately left this page's sizing and its text-only
 * digital-partners line as they were — that session's "make it big,
 * clearly visible" request was applied to `Hero`, `RegistrationLayout`,
 * and the `Footer`/homepage digital-partner rows (all places where a
 * bigger mark just reads as more premium), but a printable, screenshot-
 * able registration pass is exactly the surface the paragraph above
 * already explains a bigger or logo'd partner credit would hurt, not
 * help. The refreshed artwork itself still reaches this page — it's the
 * same `siteBranding.event.logo` path everywhere — only the size and the
 * partner treatment stayed put.
 */
export function RegistrationPass() {
  const { state } = useRegistration();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const events = state.selectedEvents
    .map((selection) => getEventById(selection.eventId))
    .filter((event): event is NonNullable<typeof event> => Boolean(event));

  const selectedPackage = state.package.packageId
    ? PACKAGES.find((option) => option.id === state.package.packageId)
    : undefined;

  async function handlePrint() {
    await printableImagesReady();
    window.print();
  }

  /** The data shown on the printed / downloaded pass — straight from the existing registration state. */
  function buildPassData(confirmation: NonNullable<typeof state.confirmation>): PassData {
    return {
      registrationId: confirmation.registrationId,
      participant: state.participant.name.trim() || "—",
      college: state.participant.collegeName.trim() || "—",
      events: events.map((event) => event.name),
      packageLabel: selectedPackage ? selectedPackage.label : "—",
      amount: state.pricing ? formatRupees(state.pricing.total) : "—",
      registeredOn: new Date(confirmation.confirmedAt).toLocaleString("en-IN"),
    };
  }

  async function handleDownload() {
    if (!state.confirmation) return;
    const data = buildPassData(state.confirmation);
    const paths = [siteBranding.event.logo, siteBranding.college.logo, ...siteBranding.digitalPartners.map((p) => p.logo)];
    const uris = new Map<string, string>();
    await Promise.all(paths.map(async (path) => uris.set(path, await logoDataUri(path))));
    const html = buildStandaloneHtml(data, (path) => uris.get(path) ?? assetPath(path));
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `AFFINITY26-Registration-Pass-${state.confirmation.registrationId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Best-effort loading gate: RegistrationProvider hydrates from
  // localStorage in its own effect after mount, so the very first client
  // render always shows `confirmation: null` (matching SSR, to avoid a
  // hydration mismatch) even when a real mock confirmation exists in
  // storage. Without this, a participant who just completed Step 06 would
  // see a flash of "No registration found" before the real pass appears.
  // This can't be made fully race-proof without a real browser to verify
  // timing against — see docs/phase-18-success-page-notes.md.
  if (!mounted) {
    return (
      <SectionContainer width="content" verticalPadding>
        <p role="status" className="text-center font-body text-sm text-desert-sand">
          Loading your registration…
        </p>
      </SectionContainer>
    );
  }

  if (!state.confirmation) {
    return (
      <SectionContainer width="content" verticalPadding>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
          <SectionHeading as="h1" title="No Registration Found" divider={false} />
          <p className="font-body text-sm text-desert-sand">
            You haven&apos;t completed the AFFINITY &apos;26 registration wizard yet, or your demo
            session has been cleared.
          </p>
          <GoldButton href="/register">Start Registration</GoldButton>
        </div>
      </SectionContainer>
    );
  }

  const { confirmation, participant } = state;

  return (
    <SectionContainer width="content" verticalPadding>
      <PrintablePass data={buildPassData(confirmation)} />
      <div
        role="status"
        className="mx-auto mb-8 max-w-2xl border border-antique-gold/50 px-4 py-3 text-center print:hidden"
      >
        <p className="font-body text-sm text-desert-sand">
          <strong className="text-ivory">No payment was processed for this registration.</strong>{" "}
          AFFINITY &apos;26 does not collect payment online. Your registration details have been
          recorded.
        </p>
      </div>

      <SectionHeading
        as="h1"
        eyebrow="AFFINITY '26 · Registration Complete"
        title="Registration Successful"
        subtitle="Your AFFINITY '26 registration has been confirmed. Carry it, print it, or save it below."
      />

      <div className="mx-auto mt-10 max-w-xl">
        <OrnamentalFrame
          padding="lg"
          className="relative print:border-midnight print:bg-ivory print:text-midnight"
        >
          <div className="flex items-center gap-3">
            <BrandLogo
              src={siteBranding.event.logo}
              alt={siteBranding.event.alt}
              heightClassName="h-8 sm:h-9"
              padding="sm"
              className="print:hidden"
            />
            {/* Print variant: `BrandLogo`'s ivory plaque is redundant once
                the whole pass card is already printed on an ivory ground
                (see `print:bg-ivory` on OrnamentalFrame above) — swap to
                the bare image so print output doesn't show a visible box
                around the mark for no reason. */}
            <BrandLogo
              src={siteBranding.event.logo}
              alt={siteBranding.event.alt}
              heightClassName="h-8"
              variant="bare"
              className="hidden print:inline-flex"
            />
            <div>
              <p className="font-body text-xs font-medium uppercase tracking-[0.2em] text-desert-sand print:text-midnight/70">
                AFFINITY &apos;26
              </p>
              <p className="font-display text-2xl font-semibold tracking-wide text-ivory print:text-midnight">
                Registration Pass
              </p>
            </div>
          </div>

          <GoldDivider size="md" className="my-6" />

          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="font-body text-xs font-medium uppercase tracking-wide text-desert-sand print:text-midnight/70">
                Registration ID
              </dt>
              <dd className="mt-1 font-body text-sm text-ivory print:text-midnight">
                {confirmation.registrationId}
              </dd>
            </div>
            <div>
              <dt className="font-body text-xs font-medium uppercase tracking-wide text-desert-sand print:text-midnight/70">
                Package
              </dt>
              <dd className="mt-1 font-body text-sm text-ivory print:text-midnight">
                {selectedPackage ? selectedPackage.label : "—"}
              </dd>
            </div>
            <div>
              <dt className="font-body text-xs font-medium uppercase tracking-wide text-desert-sand print:text-midnight/70">
                Participant
              </dt>
              <dd className="mt-1 font-body text-sm text-ivory print:text-midnight">
                {participant.name.trim() || "—"}
              </dd>
            </div>
            <div>
              <dt className="font-body text-xs font-medium uppercase tracking-wide text-desert-sand print:text-midnight/70">
                College
              </dt>
              <dd className="mt-1 font-body text-sm text-ivory print:text-midnight">
                {participant.collegeName.trim() || "—"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-body text-xs font-medium uppercase tracking-wide text-desert-sand print:text-midnight/70">
                Events
              </dt>
              <dd className="mt-1 font-body text-sm text-ivory print:text-midnight">
                {events.length > 0 ? (
                  <ul className="flex flex-col gap-0.5">
                    {events.map((event) => (
                      <li key={event.id}>{event.name}</li>
                    ))}
                  </ul>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="font-body text-xs font-medium uppercase tracking-wide text-desert-sand print:text-midnight/70">
                Amount
              </dt>
              <dd className="mt-1 font-display text-lg font-semibold text-antique-gold print:text-midnight">
                {state.pricing ? formatRupees(state.pricing.total) : "—"}
              </dd>
              <dd className="font-body text-xs text-desert-sand print:text-midnight/70">
                Estimate — subject to organizer confirmation.
              </dd>
            </div>
          </dl>

          <GoldDivider size="md" className="my-6" />

          <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:justify-between">
            <QRPlaceholder />
            <p className="max-w-[10rem] text-center font-body text-[11px] font-medium uppercase tracking-wide text-desert-sand sm:text-right print:text-midnight/70">
              Demo QR — verification will be connected later
            </p>
          </div>

          {siteBranding.digitalPartners.length > 0 ? (
            <p className="mt-6 border-t border-antique-gold/20 pt-4 text-center font-body text-[10px] uppercase tracking-[0.15em] text-desert-sand/70 print:border-midnight/20 print:text-midnight/60">
              Digital Partners —{" "}
              {siteBranding.digitalPartners.map((partner) => partner.name).join(" · ")}
            </p>
          ) : null}
        </OrnamentalFrame>
      </div>

      <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-4 sm:flex-row sm:justify-center print:hidden">
        <GoldButton type="button" onClick={handleDownload}>
          Download Pass
        </GoldButton>
        <SecondaryButton type="button" onClick={handlePrint}>
          Print
        </SecondaryButton>
        <Link
          href="/"
          className="font-body text-sm font-medium uppercase tracking-wide text-desert-sand underline decoration-antique-gold/50 underline-offset-4 transition-colors duration-fast hover:text-ivory"
        >
          Back to Home
        </Link>
      </div>
      <p className="mx-auto mt-3 max-w-xl text-center font-body text-xs text-desert-sand/70 print:hidden">
        &ldquo;Download Pass&rdquo; saves a print-ready A4 pass: open the file and choose Print
        &rarr; Save as PDF for a one-page PDF. &ldquo;Print&rdquo; prints the same one-page A4 pass.
      </p>
    </SectionContainer>
  );
}
