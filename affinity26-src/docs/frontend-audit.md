# AFFINITY '26 — Frontend Audit (Phase 01)

**Scope:** Read-only inspection. No UI code was written or modified in this phase.
**Companion doc:** see `docs/affinity-content-truth.md` for the full factual extraction from the official source materials (now much larger — a 182-page official brochure was found in this pass, in addition to the five documents inspected in the first Phase 01 pass).

## 1. Current framework / stack

**None exists.** This is a greenfield build — confirmed again on this pass.

- No `package.json`, `node_modules`, lockfile, framework config, `src/`, build tooling, or `.git` exists anywhere under the connected folder `S:\KIMS`.
- Sibling folders on the same drive (`S:\`) were checked at the directory-name level only (they belong to other clients — `DTDC`, `MKZORA`, `mkzora-website`, `Raja Lakshmi Furniture`, `Vj Womens world`, etc. — and were not opened). None is named for AFFINITY.
- The device's home directory lists unrelated personal project folders (`my-react-app`, `todolist-app`, `twitter-clone`, `kstudiovx-website`, `dyad-apps`, `workspace`, etc.) — none reference AFFINITY.

**Conclusion unchanged from the first pass:** Phase 02 scaffolds a new Next.js + TypeScript + Tailwind project from scratch. If a repo exists elsewhere that I haven't been shown, point me to it before Phase 02.

## 2. Existing architecture

N/A — none exists.

## 3. Existing reusable components

None — no component library, design system, or shared UI kit anywhere in the connected folder.

## 4. Routes / pages

N/A — no application exists yet, so there are no routes to audit. (Recommended route structure is in §8, unchanged in substance from the first audit but now informed by a much richer, verified event dataset — see the content-truth doc.)

## 5. Dependencies

N/A — no `package.json`, so no dependency list exists to audit. Project brief calls for Next.js, TypeScript, Tailwind CSS, Framer Motion/Motion, and Lucide React; none are installed anywhere yet.

## 6. Available assets

This pass found substantially more material than the first audit — two new items surfaced directly under `S:\KIMS\` (outside the `content\` folder inspected previously):

| Asset | Location | Notes |
|---|---|---|
| **Full official brochure (PDF)** | `S:\KIMS\AFFINITY26 Brochure.pdf` | **182 pages, 39 MB, text-selectable** (Canva → iLovePDF export, not a flattened image). Contains registration rules, full pricing, accommodation policy, and a complete per-event rulebook (rules, team sizes, prizes, contacts) for every sport/cultural/online event, including an esports/gaming category (E-Football, FIFA, PUBG, Free Fire) that wasn't documented anywhere in the first-pass materials. This is now the primary content source — see `docs/affinity-content-truth.md`. |
| **Design-layer asset library (PNG)** | `S:\KIMS\Affinity 26\` | **116 individual PNG exports**, filenamed "Navy And Gold Illustrative Magical Arabian Nights Virtual Invitation - N.png", 20 KB–5.4 MB each. Spot-checked two: one is the **exact clean background plate** used behind the hero poster's text (a palace-gateway night scene, no text — directly reusable as a hero/section background); another is a **cut-out decorative prop** (a stack of ornate Arabian scrolls with a lit lantern and a genie lamp, on a transparent/white background). This strongly suggests the full set of 116 is a layer-by-layer export from the brochure's Canva project — i.e. a ready-made library of premium background plates and decorative cutouts in the exact key-art style, not duplicate brochure pages. **Not exhaustively catalogued in this pass** (116 files is a lot to review one-by-one); recommend a short curation pass at the start of Phase 02 (or a dedicated sub-phase) to sort these into "usable hero/section backgrounds" vs "decorative props/dividers" vs "not useful," since this materially changes how much bespoke illustration the frontend needs to source elsewhere. |
| Key-art poster (PDF + JPEG) | `content/Herosection/...pdf` / `.jpg` | Same single-page composited poster design found in the first pass — now understood to be one specific composition built from the layer library above. |
| Promo video | `content/Promo video/lv_0_20260707191624.mp4` | ~267 MB. Still not reviewed frame-by-frame for on-screen text — flagged again as a pre-Phase-02 follow-up. |
| Registration/T&C/About docx | `content/Registration link content/`, `content/Terms and conditions/`, `content/Wordings/` | As in the first audit — now superseded/expanded by the brochure PDF wherever they overlap (see content-truth doc §14 for exactly where). |
| Gallery | `content/Gallery/` | Still **empty** — no event photography supplied. |

**Remaining asset gaps:**
- No standalone/vector logo files for the Dhruvaas crest or the "Affinity 11th Edition" crest — both still only exist as pixels baked into composited pages (the layer library doesn't appear to include isolated logo cutouts among the two samples checked; needs confirming during the curation pass).
- No favicon/app-icon asset.
- No event photography, sponsor logos, or team photos.

## 7. Available fonts

None supplied as font files (no `.ttf`/`.otf`/`.woff` anywhere under `S:\KIMS`). The brochure's display lettering is a stylised custom wordmark (rendered as artwork, not a usable web font) and its body/heading text in the PDF pages appears to be a serif/blackletter-style display face plus a plain sans body face — neither identified as a specific typeface nor supplied as an installable file. **Use the project brief's suggested pairing (Cinzel or Cormorant Garamond for display, Inter/Manrope for body) via Google Fonts**, since no source font files exist to match exactly.

## 8. Existing design system

None exists as code/tokens. The **visual language is well-established in the source art** (poster + 116-asset layer library): midnight navy/purple night skies, warm gold ornamental architecture, jewel-toned curtains (purple/burgundy/teal), lit lanterns, crescent moons, palace silhouettes — consistent with the project brief's suggested palette. No formal token file (colors/spacing/type scale) exists yet; that's a Phase 02 deliverable.

## 9. Technical limitations

- No backend, database, or API of any kind exists or should be built (frontend-only, per project rules).
- No registration link/URL exists yet in any source material — the registration wizard's "submit" step has nothing real to point to; it must stay a frontend-only mock per the brief.
- Several event facts are internally inconsistent in the official brochure itself (not a frontend bug to fix — a content gap to flag in the UI): see `docs/affinity-content-truth.md` §14, especially the refund-policy conflict and the online-events bundle scope ambiguity. The data layer needs a `verificationStatus`/flag mechanism to surface these rather than silently picking one answer.
- Day‑1/Day‑2 calendar dates and the venue address are not stated anywhere — any schedule or "where" UI must degrade gracefully to a TBA state rather than reference a date/place.
- The 182-page brochure is large (39 MB) and not meant to be shipped to the browser as-is — its content needs to be manually transcribed into the typed `data/` files during Phase 02 (there is no automated/scriptable extraction that would be safe to trust for exact figures like prize amounts and phone numbers; those were cross-checked against the actual page images in this audit, not just raw text extraction, and the same care will be needed when authoring the data files).

## 10. Recommended frontend architecture

Unchanged in shape from the first audit, but the data layer is now known to be considerably larger (18 sports events, 16 onstage + 9 offstage cultural events, 9 online-culturals events, 4 esports events — roughly 56 events total, each with its own team-size, fee, prize, deadline, and contact fields):

```
affinity26-frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx                  # Landing page (hero, story, cause, events teaser, footer)
│   ├── events/
│   │   └── page.tsx              # Events explorer (will need category/day/mode filtering
│   │                              #   given ~56 events across sports/onstage/offstage/online/esports)
│   ├── register/
│   │   └── page.tsx              # Registration wizard entry
│   ├── rules/
│   │   └── page.tsx
│   └── contact/
│       └── page.tsx
├── components/
│   ├── layout/                   # Navbar, Footer
│   ├── hero/
│   ├── sections/                 # Story, Cause, EventsTeaser, etc.
│   ├── events/                   # EventCard, EventFilterBar, EventDetailDrawer
│   ├── registration/             # WizardShell, StepParticipant, StepEvents, StepDetails,
│   │                              #   StepPackage, StepReview, StepConfirm
│   └── ui/                       # Primitive design-system components (Button, Badge, Modal…)
├── data/                         # SOURCE OF TRUTH — centralized, typed, no facts in JSX
│   ├── events.ts                 # typed Event[] — one entry per row in the content-truth
│   │                              #   doc's §6/§7/§8 tables, with a verificationStatus field
│   │                              #   for the flagged conflicts/gaps
│   ├── pricing.ts                # base packages (480/1100/1500) + per-event fee overrides
│   │                              #   (Chess, Track & Field, Short Film, online bundle, esports)
│   ├── rules.ts                  # the 17 T&C clauses + sports/culturals/accommodation general rules
│   ├── contacts.ts               # org-level + per-event contacts (§11 of content-truth doc)
│   └── content.ts                # About/theme/cause copy (verbatim from source)
├── lib/
│   ├── registration-state.ts     # wizard state machine + local persistence (frontend-only)
│   └── pricing-calc.ts           # frontend-only pricing calculation, reads data/pricing.ts
├── public/
│   └── assets/                   # curated exports from the 116-file layer library + cropped
│                                  #   hero art
└── docs/
    ├── frontend-audit.md               (this file)
    ├── affinity-content-truth.md
    ├── frontend-content-audit.md       (future — content QA once real UI copy is drafted)
    └── backend-integration-map.md      (future — documents every frontend-only mock and its
                                          intended real backend hook)
```

Same architectural principles as the first audit: every event fact renders from `data/events.ts` (never hardcoded in JSX); each record carries a `verificationStatus` so the UI can visually distinguish confirmed facts from `[VERIFY WITH ORGANIZER]` placeholders — now more important than before, since §14/§15 of the content-truth doc list several real internal conflicts in the official brochure itself, not just gaps; registration wizard stays six steps with local persistence; payment stays a clearly-labeled "Frontend Demo / Payment Integration Pending" placeholder.

## 11. Files that should be created (Phase 01 — done)

- `docs/frontend-audit.md` — this file (updated).
- `docs/affinity-content-truth.md` — updated with the full brochure extraction, reorganized into the 15 sections requested.

Not created yet (Phase 02+, listed for traceability against the brief's documentation requirement):
- `docs/frontend-content-audit.md`
- `docs/backend-integration-map.md`
- Any application source code, `package.json`, or design-token file.

## 12. Files that should not be touched

- Everything under `S:\KIMS\content\` and the two new top-level items (`S:\KIMS\AFFINITY26 Brochure.pdf`, `S:\KIMS\Affinity 26\`) — all organizer-supplied source material. Read-only reference; never edit or move the originals.

## 13. Open questions for you before Phase 02

1. **Where should the actual Next.js project live?** Still unanswered — a new subfolder inside `S:\KIMS`, elsewhere on this machine, or a repo you'll point me to.
2. **Promo video** — still unreviewed; want me to scrub it for on-screen facts before design work starts?
3. **The three real conflicts found in the official brochure itself** (refund policy, PG eligibility, online-bundle scope — content-truth doc §14 a–c) — do you have organizer clarification for any of these now, or should the site launch showing them as explicit "pending organizer confirmation" states?
4. **The 116-file design-asset library** — want me to spend a short pass cataloguing/curating it (which backgrounds/props are usable, at what resolution) before Phase 02 design work, given it looks like a genuinely reusable premium asset set?
