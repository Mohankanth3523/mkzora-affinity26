# Phase 49 — one-page A4 registration pass (print / PDF)

Only the success page's print output and its "Download Pass" file changed. The registration flow, proxy, Apps Script,
prices, events and validation are untouched.

## How it works
- `components/success/passDocument.ts` is the single source of truth for the printed pass (markup + CSS, A4 portrait,
  `@page { size: A4 portrait; margin: 0 }`, sheet 210 x 296 mm, `break-inside: avoid`).
- `RegistrationPass.tsx` mounts that sheet into `<body>` through a portal. On screen it is `display: none`, so the normal
  desktop/mobile page looks exactly as before. When printing, its CSS hides every other body child (navbar, footer,
  page content, decorative background, buttons) and shows only the A4 pass. Print -> Save as PDF = exactly one page.
- "Download Pass" saves a standalone `.html` of the same sheet with the logos embedded (data URIs). Open it and choose
  Print -> Save as PDF for the identical one-page A4 PDF.
- Values come from the existing registration state (ID, participant, college, events, package, amount); nothing is hardcoded.
  Every value is HTML-escaped. Many selected events shrink the events list (1 -> 4 columns) so the pass always fits one page.
- Logos: `public/assets/logo/{affinity-event-logo,college-logo,mkzora-logo,garudan-nexus-logo}.png` (via `siteBranding`),
  full resolution, `object-fit: contain`, on ivory plaques (two of the marks are dark). The QR is the existing vector placeholder
  (`qrGrid.ts`, moved unchanged); it is NOT a scannable code and its caption says so.
