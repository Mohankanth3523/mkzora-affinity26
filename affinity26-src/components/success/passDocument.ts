/**
 * AFFINITY '26 registration pass — the ONE-PAGE A4 print / PDF version.
 *
 * Single source of truth for the printed pass. Two callers use it, so what you print and what you download are
 * always identical:
 *   1. RegistrationPass.tsx mounts it (via a portal into <body>) while the /success page is open. It is invisible on
 *      screen (`display: none`). When the browser prints, every other element of the site (navbar, footer, page
 *      content, decorative background) is hidden and only this A4 sheet is shown.
 *   2. "Download Pass" wraps the same markup + CSS, with the logos embedded as data URIs, in a standalone .html file.
 *
 * All values (registration ID, participant, college, events, package, amount) are passed in from the existing
 * registration state; nothing is hardcoded here. Every value is HTML-escaped. Logo <img> elements use the original
 * files from public/assets/logo at full resolution with `object-fit: contain` (never stretched); the QR is vector SVG.
 */
import { siteBranding } from "@/data/branding";
import { QR_GRID } from "./qrGrid";

export interface PassData {
  registrationId: string;
  participant: string;
  college: string;
  events: string[];
  packageLabel: string;
  /** Already formatted, e.g. "₹480". */
  amount: string;
  /** Already formatted confirmation date/time, or "" to omit. */
  registeredOn: string;
}

/** Maps a `public/`-relative logo path (e.g. "/assets/logo/college-logo.png") to the URL/data-URI to put in `src`. */
export type ResolveLogo = (publicPath: string) => string;

const NAVY = "#0D1530";
const MIDNIGHT = "#070A18";
const GOLD = "#C9A24D";
const WARM_GOLD = "#E8C76A";
const IVORY = "#F7F0DE";
const SAND = "#D9C19A";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** `mode: "page"` = mounted inside the site (hidden on screen); `mode: "standalone"` = the downloaded .html file. */
export function passCss(mode: "page" | "standalone"): string {
  const modeCss =
    mode === "page"
      ? `
@media screen { .ap-root { display: none !important; } }
@media print {
  html, body { margin: 0 !important; padding: 0 !important; width: 210mm !important; height: 296mm !important;
    overflow: hidden !important; background: ${NAVY} !important; }
  body > *:not(.ap-root) { display: none !important; }
  .ap-root { display: block !important; }
}`
      : `
html, body { margin: 0; padding: 0; background: ${NAVY}; }
@media screen {
  body { background: #1b2140; padding: 12px 0; }
  .ap-root { margin: 0 auto; box-shadow: 0 6px 30px rgba(0, 0, 0, 0.55); }
}
@media screen and (max-width: 820px) { .ap-root { zoom: 0.45; } }
@media print {
  html, body { width: 210mm; height: 296mm; overflow: hidden; }
}`;

  return `
@page { size: A4 portrait; margin: 0; }
.ap-root, .ap-root * { box-sizing: border-box; }
.ap-root {
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
  position: relative; width: 210mm; height: 296mm; overflow: hidden;
  background: radial-gradient(ellipse at 50% 0%, #1B2653 0%, ${NAVY} 45%, ${MIDNIGHT} 100%);
  color: ${IVORY};
  font-family: var(--font-body, Inter, "Segoe UI", Helvetica, Arial, sans-serif);
  line-height: 1.3;
  break-inside: avoid; page-break-inside: avoid; page-break-after: avoid; page-break-before: avoid;
}
.ap-sheet { position: absolute; inset: 0; padding: 8mm; display: flex; flex-direction: column; }
.ap-frame {
  position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: space-between;
  gap: 3mm; padding: 8mm 10mm; border: 0.7mm solid ${GOLD};
}
.ap-frame::before { content: ""; position: absolute; inset: 1.6mm; border: 0.25mm solid rgba(201, 162, 77, 0.55); pointer-events: none; }
.ap-frame > * { position: relative; }

.ap-head { display: flex; align-items: center; justify-content: space-between; gap: 5mm; }
.ap-emblem { display: block; height: 31mm; width: auto; max-width: 31mm; object-fit: contain; flex: none; }
.ap-titles { flex: 1; min-width: 0; text-align: center; }
.ap-eyebrow { margin: 0; font-size: 7.5pt; letter-spacing: 0.24em; text-transform: uppercase; color: ${SAND}; }
.ap-h1 { margin: 1.2mm 0; font-family: var(--font-display, Cinzel, Georgia, "Times New Roman", serif); font-weight: 700;
  font-size: 22pt; letter-spacing: 0.04em; white-space: nowrap; color: ${WARM_GOLD}; line-height: 1.05; }
.ap-sub { margin: 0; font-family: var(--font-display, Cinzel, Georgia, serif); font-size: 11pt; letter-spacing: 0.2em;
  text-transform: uppercase; color: ${IVORY}; }

.ap-plaque { display: flex; align-items: center; justify-content: center; background: ${IVORY};
  border: 0.4mm solid rgba(201, 162, 77, 0.85); border-radius: 1.6mm; padding: 2mm 3mm; }
.ap-plaque img { display: block; object-fit: contain; max-width: 100%; max-height: 100%; width: auto; height: auto; }
.ap-college { width: 52mm; height: 25mm; flex: none; }
.ap-org { margin: 0; text-align: center; font-size: 8.5pt; letter-spacing: 0.05em; color: ${SAND}; }
.ap-org strong { display: block; color: ${IVORY}; font-weight: 600; font-size: 9pt; letter-spacing: 0.06em; }

.ap-rule { height: 0.3mm; flex: none; background: linear-gradient(90deg, transparent, ${GOLD}, transparent); }

.ap-label { margin: 0 0 1mm; font-size: 7pt; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: ${SAND}; }
.ap-id { text-align: center; padding: 4mm 3mm; border: 0.35mm solid rgba(201, 162, 77, 0.75); background: rgba(201, 162, 77, 0.1); }
.ap-id .ap-label { margin-bottom: 1.5mm; }
.ap-id-value { margin: 0; font-family: var(--font-display, Cinzel, Georgia, serif); font-weight: 700; font-size: 25pt;
  letter-spacing: 0.1em; color: ${WARM_GOLD}; line-height: 1.1; overflow-wrap: anywhere; }

.ap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4.5mm 8mm; }
.ap-span2 { grid-column: 1 / -1; }
.ap-value { margin: 0; font-size: 12pt; font-weight: 500; color: ${IVORY}; overflow-wrap: anywhere; }
.ap-events { margin: 0; padding: 0; list-style: none; columns: 1; column-gap: 8mm; }
.ap-tier-b .ap-events { columns: 2; }
.ap-tier-c .ap-events { columns: 3; column-gap: 6mm; }
.ap-tier-c .ap-events li { font-size: 9.5pt; margin-bottom: 0.6mm; }
.ap-tier-d .ap-events { columns: 4; column-gap: 5mm; }
.ap-tier-d .ap-events li { font-size: 8pt; margin-bottom: 0.4mm; padding-left: 3mm; }
.ap-events li { break-inside: avoid; margin: 0 0 1mm; font-size: 11.5pt; color: ${IVORY}; padding-left: 4mm; position: relative; }
.ap-events li::before { content: "\\25C6"; position: absolute; left: 0; top: 0.5mm; font-size: 6pt; color: ${GOLD}; }

.ap-lower { display: grid; grid-template-columns: 50mm 1fr; gap: 8mm; align-items: center; }
.ap-qr { display: flex; flex-direction: column; align-items: center; gap: 1.5mm; }
.ap-qr-box { background: ${IVORY}; padding: 5mm; border: 0.4mm solid rgba(201, 162, 77, 0.85); border-radius: 1.2mm; }
.ap-qr-box svg { display: block; width: 36mm; height: 36mm; }
.ap-qr-cap { margin: 0; text-align: center; font-size: 6.5pt; letter-spacing: 0.08em; text-transform: uppercase; color: ${SAND}; }
.ap-amount { margin: 0; font-family: var(--font-display, Cinzel, Georgia, serif); font-weight: 700; font-size: 26pt; color: ${WARM_GOLD}; line-height: 1.1; }
.ap-note { margin: 1.5mm 0 0; font-size: 8pt; color: ${SAND}; }
.ap-notice { margin: 4mm 0 0; padding-top: 3mm; border-top: 0.25mm solid rgba(201, 162, 77, 0.45); font-size: 8pt; color: ${IVORY}; }
.ap-notice strong { font-weight: 600; }
.ap-when { margin: 1.5mm 0 0; font-size: 7.5pt; color: ${SAND}; }

.ap-partners { text-align: center; }
.ap-partners .ap-label { margin-bottom: 2mm; }
.ap-partner-row { display: flex; justify-content: center; align-items: stretch; gap: 8mm; }
.ap-partner { width: 66mm; height: 34mm; }
.ap-partner img { max-height: 30mm; }
.ap-tier-c .ap-partner { height: 28mm; } .ap-tier-c .ap-partner img { max-height: 24mm; }
.ap-tier-d .ap-partner { height: 24mm; } .ap-tier-d .ap-partner img { max-height: 20mm; }
.ap-tier-d .ap-qr-box { padding: 3.5mm; } .ap-tier-d .ap-qr-box svg { width: 28mm; height: 28mm; }
.ap-tier-c .ap-id, .ap-tier-d .ap-id { padding: 2.5mm 3mm; }
.ap-tier-d .ap-emblem { height: 26mm; } .ap-tier-d .ap-college { height: 21mm; }
.ap-tier-d .ap-frame, .ap-tier-d { gap: 2mm; }
`.replace(/\n\s*\n/g, "\n") + modeCss;
}

function qrSvg(): string {
  const cell = 8;
  const size = QR_GRID.length * cell;
  const cells = QR_GRID.map((row, y) =>
    row
      .map((on, x) => (on ? `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="${MIDNIGHT}"/>` : ""))
      .join(""),
  ).join("");
  return `<svg role="img" aria-label="Demo QR placeholder — not a real, scannable code" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" fill="${IVORY}"/>${cells}</svg>`;
}

/** The A4 sheet's inner markup (everything inside `.ap-root`). */
export function buildPassMarkup(data: PassData, resolveLogo: ResolveLogo): string {
  const e = escapeHtml;
  const college = siteBranding.college;
  const event = siteBranding.event;
  const events =
    data.events.length > 0 ? data.events.map((name) => `<li>${e(name)}</li>`).join("") : "<li>—</li>";
  const partners = siteBranding.digitalPartners
    .map(
      (p) =>
        `<div class="ap-plaque ap-partner"><img src="${e(resolveLogo(p.logo))}" alt="${e(p.alt)}" decoding="sync" loading="eager"></div>`,
    )
    .join("");

  // Layout tier keeps the pass on ONE page however many events were selected (columns and sizes shrink gradually).
  const count = data.events.length;
  const tier = count <= 6 ? "a" : count <= 14 ? "b" : count <= 24 ? "c" : "d";

  return `<div class="ap-sheet"><div class="ap-frame ap-tier-${tier}">
<div class="ap-head">
  <img class="ap-emblem" src="${e(resolveLogo(event.logo))}" alt="${e(event.alt)}" decoding="sync" loading="eager">
  <div class="ap-titles">
    <p class="ap-eyebrow">11th Edition &middot; Arabian Nights</p>
    <h1 class="ap-h1">AFFINITY &rsquo;26</h1>
    <p class="ap-sub">Registration Pass</p>
  </div>
  <div class="ap-plaque ap-college"><img src="${e(resolveLogo(college.logo))}" alt="${e(college.alt)}" decoding="sync" loading="eager"></div>
</div>
<p class="ap-org"><strong>${e(college.name)}</strong>Presented by the ${e(siteBranding.batch.name)}</p>
<div class="ap-rule"></div>
<div class="ap-id"><p class="ap-label">Registration ID</p><p class="ap-id-value">${e(data.registrationId)}</p></div>
<div class="ap-grid">
  <div><p class="ap-label">Participant</p><p class="ap-value">${e(data.participant)}</p></div>
  <div><p class="ap-label">Package</p><p class="ap-value">${e(data.packageLabel)}</p></div>
  <div class="ap-span2"><p class="ap-label">College</p><p class="ap-value">${e(data.college)}</p></div>
  <div class="ap-span2"><p class="ap-label">Events</p><ul class="ap-events">${events}</ul></div>
</div>
<div class="ap-rule"></div>
<div class="ap-lower">
  <div class="ap-qr"><div class="ap-qr-box">${qrSvg()}</div><p class="ap-qr-cap">Demo QR &mdash; verification will be connected later</p></div>
  <div>
    <p class="ap-label">Amount</p>
    <p class="ap-amount">${e(data.amount)}</p>
    <p class="ap-note">Estimate &mdash; subject to organizer confirmation.</p>
    <p class="ap-notice"><strong>No payment was processed for this registration.</strong> AFFINITY &rsquo;26 does not collect payment online.</p>
    ${data.registeredOn ? `<p class="ap-when">Registered ${e(data.registeredOn)}</p>` : ""}
  </div>
</div>
<div class="ap-partners"><p class="ap-label">Digital Partners</p><div class="ap-partner-row">${partners}</div></div>
</div></div>`;
}

/** Complete standalone document for "Download Pass". Open it and choose Print -> Save as PDF: exactly one A4 page. */
export function buildStandaloneHtml(data: PassData, resolveLogo: ResolveLogo): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AFFINITY '26 Registration Pass — ${escapeHtml(data.registrationId)}</title>
<style>${passCss("standalone")}</style>
</head>
<body>
<div class="ap-root">${buildPassMarkup(data, resolveLogo)}</div>
</body>
</html>`;
}
