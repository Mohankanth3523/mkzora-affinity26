# AFFINITY '26 — Content Source of Truth

**Status:** PHASE 01 — AUDIT ONLY. Not yet wired into any frontend code.
**Rule:** Contains ONLY information found verbatim (or directly, unambiguously inferable) in the official source materials in `S:\KIMS\`. Anything not present is listed in §15 and MUST NOT be fabricated by the frontend.

**Major update from the first Phase 01 pass:** two new source items were found under `S:\KIMS\` (outside the original `content\` folder) that were not present during the first audit:

| New item | Type | What it is |
|---|---|---|
| `S:\KIMS\AFFINITY26 Brochure.pdf` | PDF, **182 pages**, 39 MB | The **full official brochure** — text-selectable (Canva → iLovePDF export). Contains registration rules, pricing, accommodation policy, and a complete per-event rulebook (rules, team sizes, eligibility, prize values, contact numbers) for every sport, cultural, and online event, including an esports/gaming category not present in the original `content\Registration link content` docx. This is now the primary source of truth and supersedes the shorter documents from the first audit wherever they overlap. |
| `S:\KIMS\Affinity 26\` | 116 PNG files, ~1–5 MB each | Individual Canva design-layer exports in the Arabian Nights key-art style (palace-gateway background plates, genie lamps, stacked scrolls, lanterns, curtains, ornamental frames — see `docs/frontend-audit.md` §4 for detail). These are cut-out visual assets, not brochure pages. |

The original five documents from the first audit (`content\Herosection\...`, `content\Registration link content\...`, `content\Terms and conditions\...`, `content\Wordings\Affinity 26.docx`) were re-checked against the new brochure; overlaps and genuine conflicts are called out in §14.

**Phase 35 update:** a supplementary PDF and a supplementary DOCX were supplied directly in-session (not from `S:\KIMS\`) specifically for the event/registration pricing restructuring phase. Both focus on the **direct-contact events** — the 12 events with their own separate entry fee and in-charge, handled outside the three registration packages (see the new §5.1). They corroborate most of the brochure's existing figures, but also surface three genuine discrepancies, called out in §14(g)–(i) and reflected in the affected rows of §6/§7/§8 below. Nothing in this update changes §1–§4, §9–§13, or §16.

---

## 1. Event identity

- **AFFINITY '26 — 11th Edition**, presented by the **Dhruvaas batch**, at **Karpaga Vinayaga Institute of Medical Sciences and Research Centre**.
- Brochure's own description: *"the flagship inter-college cultural and sports extravaganza hosted annually by Karpaga Vinayaga Institute of Medical Sciences and Research Centre... a vibrant platform where thousands of medical students from across India come together to showcase their talents, creativity, and sportsmanship. Now, celebrating a decade of brilliance, Affinity 2026 – 11th Edition promises to be bigger, bolder, and more magical than ever before!"*
- Duration: **three days** of sports and cultural events (per the Wordings doc; the new brochure structures culturals across "Day‑1 / Day‑2 / Day‑3").
- Official taglines (poster + brochure cover): **"Beyond the Sands, A Kingdom Awaits."** and **"A Legacy Forged in Struggle"**.
- Organising secretaries: **Murugarassan — 9942904259**, **Pooja — 7695813823**.

## 2. Theme

Arabian Nights. Two verbatim descriptions exist across the source docs (both consistent, no conflict — the brochure's is the newer/longer version):

> "Arabian Nights transports us into a world of timeless tales, enchanting landscapes, royal splendour, mystery, and imagination... every corner holds a story waiting to unfold." — *Wordings/Affinity 26.docx*

> "This year, step into a world of timeless tales, vibrant colours, and the grandeur of Arabian culture. With Arabian Nights as our theme, Affinity 2026 brings together music, artistry, talent, and celebration. As the campus transforms into a realm of elegance and wonder, every moment becomes a tale waiting to be told." — *AFFINITY26 Brochure.pdf*

## 3. Cause

**Blindness** — awareness, eye-care initiatives, and improving access to vision care. A portion of funds raised through the event goes toward this cause (no percentage or beneficiary named anywhere). The theme is carried into event design: the online **Pencil Painting** event's stated theme is *"A whole new world beyond sight"* — art inspired by Aladdin/Arabian Nights that also "conveys a message about blindness awareness and the value of vision."

## 4. Registration

- Registration is **mandatory** to participate in any event.
- Must be completed **only through the official registration link** (no URL is present in any supplied document — checked the PDF for embedded link annotations; none found).
- On-spot registration must also go through the same official link — **cash is not accepted at the registration desk**.
- **Original college ID card** (both hardcopy and softcopy) is mandatory; must be submitted at registration, and the softcopy plus "Affinity tag" must be shown to event in-charges before each event.
- Registered individuals must carry **proof of transaction**.
- Registration closes **2 hours prior** to the respective event.
- **Affinity tag is mandatory** for entry into the auditorium; the registration desk itself closes for **2 hours during the sports inauguration**.
- A participant may join **any number of events**, as long as timings don't clash.
- ID cards are returned only if the Affinity tag is returned; **lost tags are not replaced** — a new tag costs a separate fee (amount not stated — see §15).
- Food and accommodation are available, charged **only through the registration link**.
- Registration desk contacts: **Adhithya Raja Rajan — 7806802451**, **Thirumaran — 7904896669**. Treasuries: **Thanuja H — 7397371406**, **Jaiya Rishvanth R.K — 9150893622**.
- Last date for online-entry submissions (culturals/online events generally): **26/09/2026**.
- ⚠️ See §14(a) for a conflict in the refund policy across documents.

## 5. Pricing

Verified against the brochure's pricing page (page 7 of the PDF) directly, not just OCR text:

| Package | Price |
|---|---|
| Registration only | ₹480 |
| Registration + Food | ₹1,100 |
| Registration + Food + Accommodation | ₹1,500 |

| Event-specific fee | Price |
|---|---|
| Short Film | ₹1,500 per film |
| Track & Field (athletics events specifically) | ₹150 per individual |
| Chess — for participants competing **only** in Chess | ₹250 (replaces the general package; resolves the ambiguous "(only chess not applicable)" note found in the original registration docx during the first audit) |
| Badminton *(added Phase 35 — not previously documented; see §6)* | ₹600 per team |
| Sollal Vel — preliminary entry | ₹100 per person |
| Sollal Vel — finalist advancement (6 finalists only) *(corrected Phase 35 — see §7 and §14(i))* | ₹380 |
| Online events bundle | ₹100 per person — "inclusive of Photography, Reels, Memes, Painting, English Poetry, Tamil Poetry, Pes" *(verbatim from the brochure — "Pes" is cut off/incomplete in the source artwork itself, and "Memes" does not correspond to any named event anywhere else in the brochure; see §14(c))* |

| Esports/gaming entry fee | Price |
|---|---|
| E-Football 1v1 | ₹100 per person |
| E-Football 2v2 | ₹150 — unit disputed: per person in one Phase 35 source, per team in another; not resolved either way — see §14(h) |
| FIFA | ₹100 per person |
| PUBG | ₹400 per squad, or ₹100 per person |
| Free Fire | ₹200 per team (4 players) |

⚠️ **[VERIFY WITH ORGANIZER]** — the brochure never states how the base "Registration" package fee relates to individual sports (other than Chess/Track & Field/Badminton) or individual onstage/offstage cultural events (other than Short Film/Sollal Vel). It is not explicit whether entry to e.g. Cricket, Volleyball, Traditional Dance, etc. is included in the ₹480/1,100/1,500 base package, or requires an additional unstated fee.

### 5.1 Registration mode (added Phase 35)

The Phase 35 supplementary documents establish, for the first time, an explicit two-way split of every AFFINITY '26 event:

- **Standard events (44)** — every event not listed below. Covered entirely by whichever of the three packages a participant selects; no separate fee.
- **Direct-contact events (12)** — have their own separate entry fee, paid and registered directly with the event's in-charge, never through the package flow: **Chess, Badminton, Athletics — Track, Shot Put, Discus Throw, Javelin Throw, Free Fire, PUBG, E-Football, FIFA, Short Film, Sollal Vel.**

This mirrors, and makes explicit, a distinction the fee tables above already implied (Chess/Track & Field/Short Film/the esports titles already had their own stated fees; nothing else did) — Badminton and Sollal Vel are the two events whose direct-contact status and/or fee were not previously fully documented (see the corrections in §6/§7 and §14(h)–(i)). `types/event.ts`'s `registrationMode` field is the frontend's implementation of this split — see `docs/phase-35-event-pricing-restructure-notes.md`.

**Frontend display note (Phase 31, event selection & pricing cleanup):** the tables above remain the full, unedited source of truth. As of Phase 31, the participant-facing frontend (`lib/registration/pricing.ts`) intentionally displays *only* the selected package's own price (₹480 / ₹1,100 / ₹1,500) as the Estimated Total — no per-event fee from either table above, and no event-specific override, is added to or substituted for that number in the UI. This was an explicit instruction in that phase's brief ("Do NOT add individual event fees to the displayed total... Do not display separate prices for... chess... online events... any other individual event"), not a correction of the source. In particular: **the Chess-only ₹250-replaces-the-package rule above is currently not reflected anywhere in the frontend's displayed total** — a Chess-only registrant now sees the flat package price (e.g. ₹480) rather than ₹250. ⚠️ **[VERIFY WITH ORGANIZER]** how that display should reconcile with the actual amount collected at/after registration for a Chess-only entry, before this goes live for real payments.

## 6. Sports (offline)

General eligibility for all sports (see §9 for full detail): open to all medical colleges, MBBS students only (batches 2021–2026), PG not allowed unless the specific sport says otherwise, host college does not compete in its own tournament, referee/organizing-committee decision final, disclaimer that prize amounts may change based on number of entries.

| Event | Format / Team size | Key notes | Prize (as stated) | Contact |
|---|---|---|---|---|
| Cricket | 1 team/college, 15 members (11+4), knockout | Whites compulsory; red ball day / pink ball night matches; PGs not allowed; first 36 teams only | Winner ₹25,000 / Runner ₹15,000 | Sudharsan 6382236042, Nirmal Jose 8220717499 |
| Volleyball | 2 teams/college, 6 mains + up to 6 subs, knockout, 15 pts best-of-3 | Rotation compulsory | Boys: W ₹15,000/R ₹10,000. Girls: W ₹8,000/R ₹6,000 | Saijeyan 8838478854, Vinoth 8428272818, Vaishnavi 9946572728, Haritha 9025310465 |
| Basketball 5s (Boys & Girls) | Max 1 team/college, max 12 incl. subs, 4 quarters, knockout, FIBA rules | Only MBBS (UG) | Boys: W ₹15,000/R ₹10,000. Girls: W ₹8,000/R ₹6,000 | Ram Prashath 6383437190, Praveen Kumar 7604900144, Varunika S 9087712844, Nandhini 9342848865 |
| Basketball 3s (Boys only) | 1 team/college, max 4 incl. subs, 2 halves, knockout | Only MBBS (UG) | W ₹3,000/R ₹1,500 | Ram Prashath 6383437190, Praveen Kumar 7604900144 |
| Football | 11-a-side, 1 team/college, max 16 incl. subs, knockout, 15-5-15 min timing | UG + max 2 PGs per team; first 32 teams only; prelims date TBA | W ₹15,000/R ₹10,000 | Dharani Vendhan 8438050809, Magizhan Vasigar 9940731010 |
| Kabaddi | Max 2 entries/college, 7 mains + 5 subs, knockout, on mat | Only UG (1st yr–intern); weight limit 80kg for boys, none for girls; host team excluded | Boys: W ₹10,000/R ₹7,000. Girls: W ₹6,000/R ₹4,000 | Boys: Gopinath 9940560860, Akash 9146666444. Girls: Kuzhali K 8015562792 |
| Throwball | Max 2 teams/college, boys 7+5 subs / girls 9+3 subs, 3 sets of 21 pts, knockout, ITF rules | — | Boys: W ₹10,000/R ₹7,000. Girls: W ₹10,000/R ₹7,000 | Shivani 7904675977, Padmavathi 7010959669 |
| Futsal | Max 2 teams/college (boys & girls separately), max 8 incl. subs, knockout | UG + max 1 PG per team; timings 7-1-7 (boys)/6-1-6 (girls); penalties on draw | Boys: W ₹8,000/R ₹5,000. Girls: W ₹6,000/R ₹4,000 | Kanish Krishnakanth 8148562050, Vignesh 8893964557, Harijedha 6374251368, Tejasvi 9385935918 |
| Kho Kho | 1 team/college, 9 players + 3 subs, 2 innings of 5 min (5-2-5 format), knockout | — | Boys: W ₹7,000/R ₹4,000. Girls: W ₹6,000/R ₹3,000 | Thamizhl Oviya 6381886369, Dhanushree 9894743674 |
| Table Tennis | Max 3 players/team, max 2 teams/college, 3 sets (singles/doubles/reverse singles), 11-pt games, ITTF rules | Bat not provided (bring own); ball provided | Boys: W ₹5,000/R ₹3,000. Girls: W ₹4,000/R ₹2,000 | Arun 6379817996, Agasthiya 9361424608 |
| Tennis | Max 2 teams/college, singles only, standard scoring, knockout, ITF rules, best-of-3 semis/finals | Racket not provided (bring own); ball provided | Boys: W ₹5,000/R ₹3,000 | Dinesh Nandhan 8667228695 |
| Carrom | Any number of teams/college, knockout, black & white | Format (4-set points or best-of-3 doubles) decided by entries; online registration mandatory | Boys: W ₹4,000/R ₹3,000. Girls: W ₹4,000/R ₹3,000 | Pawan Kumar 8667763161, Vijayadharshini 9342643364 |
| Chess | Individual (no teams), knockout, 10-min rapid, FIDE rules | Bring own board/clock; 2 illegal moves = loss; **separate ₹250 fee for Chess-only participants** (see §5) | W ₹4,000/R ₹3,000 | Sudesh 7041119165, Usha 9342967872 |
| Athletics — Track (100m, 200m, 400m, 4×100m relay) ⚠️ | Boys & girls; max 1 relay team/college + 1 substitute | Max 3 individual events per athlete (2 track+1 field or 1 track+2 field) | Relay: 1st ₹4,000/2nd ₹2,000/3rd ₹1,000. Individual (100/200/400/4×100): 1st ₹2,000/2nd ₹1,500/3rd ₹1,000 | Kanishkar 9994449872, Sharan Kumar 8610209288, Hareni AS 9360222917, Vanathy 9042380875 — **contact list disputed, see §14(g)** |
| Javelin Throw ⚠️ | 3 chances/person, no trials | Men 800g / Women 600g | Boys & Girls: 1st ₹2,000/2nd ₹1,500/3rd ₹1,000 | same athletics team as above — **contact list disputed, see §14(g)** |
| Discus Throw ⚠️ | 3 chances/person, no trials, 2.5m rim | Men 2kg / Women 1kg | Boys & Girls: 1st ₹2,000/2nd ₹1,500/3rd ₹1,000 | same athletics team as above — **contact list disputed, see §14(g)** |
| Shot Put ⚠️ | 3 chances/person, no trials, 2.1m rim | Men 7.26kg / Women 4kg | Boys & Girls: 1st ₹2,000/2nd ₹1,500/3rd ₹1,000 | same athletics team as above — **contact list disputed, see §14(g)** |
| Badminton | Team event: singles/doubles/reverse singles, min 2–max 3 players | 21 pts till QF, 30 pts semis/finals; Mavis 350 shuttle; own racquets; **venue TBA**, timing **8 AM**; **₹600 per team direct-contact fee** *(added Phase 35 — see §5)* | Boys: W ₹4,000/R ₹2,000. Girls: W ₹3,000/R ₹1,500 | Magizhan Vasigar 9940731010, Sidharth Vedha 9345764788, Janani Sri 6383589616, Ragavarshini 9952313626 |

Athletics-wide notes: a college may enter max 2 persons per individual event; only 1 relay team per college; separate ₹150 fee for exclusively Track & Field participants (§5).

## 7. Cultural events (onstage + offstage)

General rules for all culturals: registration mandatory, only MBBS students (batches 2021–2026), **no PGs allowed** (no per-event exception found anywhere in the culturals section), onstage performance order decided by lot before the event, limited-slot events prioritized by registration order, no second chance if a team misses its slot, judges'/organizing-committee decision final, participants must be present ≥2 hrs before the event, softcopy ID + Affinity tag shown to in-charges beforehand, no obscenity/plagiarism/vulgarity (disqualification), coordinator name & contact required at registration, e-certificates issued for online events, no bot-likes, damage to college property penalized, no smoking/alcohol/narcotics, prize amounts may change with entries, **last date for online-entry submission: 26/09/2026**. Cultural secretaries: **Kulakeerthivasan K — 7092963831**, **Karthika Sri R — 9363308713**.

### Onstage

| Event / Day | Key rules | Prize | Contact |
|---|---|---|---|
| Sollal Vel ⚠️ *(Day 1; Tamil-language debate/oratory event — resolves the "solal vel" spelling ambiguity from the original registration docx)* | Any number of participants per college; prelim online round (₹100 to enter), 6 finalists pay **₹380** more to advance *(corrected Phase 35 from a previously recorded ₹350 — see §14(i))*; avoid controversial topics; 5–7 min per speaker; judge's decision final | 1st ₹5,000 / 2nd ₹2,500 | Rani +91 96770 23216, Priyanka +91 63796 03180 |
| Connexion (Day 1) | 2 teams/college, max 2 members/team; offline prelims Day 1, final onstage same day | 1st ₹4,000 / 2nd ₹2,000 | Shifa +91 97905 15831, Sasithra +91 93614 11305 |
| Short Film (Day 1) | Multiple entries/college; MBBS-only cast/crew; 10–13 min; ₹1,500/film fee (see §5); entries via Google Drive link on WhatsApp by 26/09/2026; only top 5 selected for stage screening | 1st ₹7,500 / 2nd ₹5,000 | Arulmozhiselvan +91 94892 37220, Harshada +91 93600 39680 |
| Traditional Dance (Day 1) | 1 entry/college (solo or group, up to 12); classical/traditional only; 5 min max; track submitted by 26/09/2026 | 1st ₹8,000 / 2nd ₹4,000 | Ragavarshini +91 99523 13626, Ezhil +91 89392 70332 |
| Dub in Live (Day 1) | Solo or team (max 2); own video clip (with + without audio); 2–4 min | Winner ₹4,000 / Runner ₹2,000 | Ponni 8838641421, Mridhula 8838864228 |
| Solo Singing (Day 2) | 4 min max; any language; karaoke/own instruments; karaoke sent by 26/09/2026 | W ₹5,000 / R ₹2,500 | Thuviksha 6383338974, Varsha S 9384107122 |
| Duet Singing (Day 2) | Any gender pairing; multiple entries/college; 4 min max; karaoke by 26/09/2026 | W ₹6,000 / R ₹3,000 | Kavya R 9176547443, Priya R 9487402110 |
| Channel Surfing (Day 2) | 1 team/college, 5–15 members; first 10 team registrations only; 5 min | W ₹8,000 / R ₹5,000 | Saipriya B 9344805574, Yashaswini T G 8870176821 |
| Replica (Day 2) | 1 team/college, first 15 registrations only, 5–20 members; 5–6 min; recreate an Indian movie song; MP4 mailed by 26/09/2026 | Winner ₹9,000 / Runner ₹6,000 | Sidharth Vedha S 9345764788, Avanthika S 9710970890 |
| Parody (Day 2) | 1 team/college, 8–15 members; max 7 teams (priority by registration order); 3–5 min | W ₹4,000 / R ₹2,000 | Subiksha M 8015267723, Sangavi S (number garbled in source: "7604...9575...65") |
| Twinning (Day 2) | Max 1 team/college, first 15 registrations only; same-college only, no gender spec; 2–4 min; audio via email by 26/09/2026 | Winner ₹6,000 / Runner ₹3,000 | Syamala C 6369439100, Srinidhi P 9363105509 |
| Battle of Bands (Day 3) | Max 10 members/band; no cross-college members; prelims day before if needed; 7 min performance + 5 min soundcheck; drums provided, other instruments brought by team | 1st ₹12,000 / 2nd ₹8,000 | Kirtin Kannan 8778511890, S. Harini 9962341102 |
| Solo Instrument (Day 3) | Any entries/college; 4–6 min + 3 min setup; only drums provided | 1st ₹4,000 / 2nd ₹2,000 | Febina Bose 9842228726, Sancia Satheesh 7305992318 |
| Heels and Capes (Day 3) | Theme "The 7 Dynasties" (Roman, Greek, Ming, Cholan, Viking, Arabian, Mughal); 4–8 members/team; **only first 12 entries accepted** | 1st ₹6,000 / 2nd ₹3,000 | Shalini T 9003112839, Sivasankari B 9487179120 |
| Adaptunes (Day 3) | **Date: 3rd October**; 1.5–2.5 min; max 2 participants/college; freestyle dance to random music with props | 1st ₹4,000 / 2nd ₹2,000 | Sachita S 9361231767, Niveditha R S 9043809023 |
| Group Dance (Day 3) | 1 team/college, 5–15 members, all same college; 5–10 min freestyle; MP3 by 26/09/2026 | 1st ₹15,000 / 2nd ₹10,000 | Sonalisha 9345202722, Sriram 9344263684 |

### Offstage

| Event | Key rules | Prize | Contact |
|---|---|---|---|
| Face Painting | Theme "Beauty of Brokenness"/"Metamorphosis"; 90 min; 1 entry/person, 3 entries/college max; face + neck only | 1st ₹2,000 / 2nd ₹1,000 | Divya Dharshini 8122103587, Pavithra M 8610219280 |
| Fireless Cooking | Max 3 entries/college, 3–5 members/team; 1.5 hr prep; vegetarian only; no readymade ingredients | 1st ₹3,000 / 2nd ₹1,500 | Harini Sivakumar 9585853199, Roshini 7418878833 |
| Rangoli | Theme "Vision through heart and vision behind eyes"; max 2 teams/college, 2–4 members; 4×4 ft space; 90 min | 1st ₹3,000 / 2nd ₹1,500 | Pavithra H 9787274222, Rashmika 6380555844, Rithika 9080839326 |
| Just a Minute | English only; 1 topic on spot; 1 min speaking time | 1st ₹1,000 / 2nd ₹500 | Venkadesh 9344714120, Viswatharani 9944743700 |
| IPL Auction | Offline; 2 participants/team, max 10 teams, 1 team/college; squad = 12 players (4 batsmen, 4 bowlers, 2 all-rounders, 2 WK; 8 Indian + 4 overseas) | 1st ₹2,000 / 2nd ₹1,000 | R Nirmal Jose 8220717499, Madhumitha S 8072326706 |
| Rapunzel (Hairstyle) | Individual, both genders; 90 min; created live (no pre-styled hair); no heat tools | 1st ₹2,000 / 2nd ₹1,000 | Monika R 8807209453, Meyyammai 7339284817 |
| Cinema Quiz | Cross-college teams not allowed; max 3 members/team; written prelim (20 Qs/20–25 min); top 5 to finals | 1st ₹3,000 / 2nd ₹1,500 | Divya Lakshmi 6381600282, Varshani 7904741991 |
| Diagnosis Detective | Open to all MBBS years; max 3 members/team, max 3 teams/college; prelim MCQs → mains, top 5 qualify | 1st ₹1,000 / 2nd ₹500 | Bharathvasan K 9940662919, Shyam Sundar 7305102182 |
| Vegetable Carving | Max 3 members/team, max 3 entries/college; 90 min; fresh raw vegetables only, no pre-carving | 1st ₹1,000 / 2nd ₹500 | N. Poovizhi 8248464318, Ashvika R R 9042959809 |

## 8. Online events

### Online — Culturals (₹100 bundle fee per person, per §5)

| Event | Key rules | Prize | Contact |
|---|---|---|---|
| Photography | Theme "Magic in the ordinary"; minimal editing only, no AI/morphing; 1 entry/person; submit before 26/09/2026 | Judgement ₹1,500 / Likes ₹1,500 | Muthamil 7604848781, Subhasri 9597492488 |
| Reels | Any theme; ≤60 sec; 1 entry/person; submit before 26/09/2026 | Judgement ₹1,500 / Likes ₹1,500 | Dhanushree 9894743674, Sanah J 9176607219 |
| Pencil Painting | Theme "A whole new world beyond sight" (Aladdin + blindness-awareness message); pencil only; 1 entry/person; PDF by 26/09/2026 | Judgement ₹1,000 / Likes ₹1,000 | Janani S 9360567134, Haritha 9025310465 |
| Painting | Theme "Oneiric synapse: The concept of living light"; 1 entry/person; PDF by 26/09/2026 | Judgement ₹1,000 / Likes ₹1,000 | Musfira 9363038273, Sanafathima 9962528025 |
| Poetry (Tamil) | Topics: "Modern love", "Unity in diversity"; 10–15 lines; via official Google Form | Judgement ₹1,000 / Likes ₹1,000 | Usha 9342967872, Priyanka 8056897831 |
| Poetry (English) | Theme "Weight of invisible scars"; 8–12 lines; 1 entry/person; JPEG image upload; submit by 26/09/2026 | Judgement ₹1,000 / Likes ₹1,000 | Thamizhl Oviya 6381886369, Subiksha 8015267723 |
| Movie Scene Recreation | Any movie scene/song; original + recreation combined 16:9; ≤60 sec; submit by 26/09/2026 | Winner ₹1,500 / Runner ₹1,500 | Adhithya 7806802451, Agasthiya 9361424608 |
| AI Poster | Theme "The Lamp of Dreams"; AI tool + prompts must be credited; submit by 26/09/2026; posted on @affinity.kims | Judgement ₹1,500 / Likes ₹1,500 | Rithika Shivani T 9080839326, Dharshana B 9342374362 |
| Movie Poster Recreation | Any movie/series; credit editing app + title/director; submit by 26/09/2026; posted on @affinity.kims | Winner ₹1,500 / Runner ₹1,500 | Srinidhi K 7708612316, M. Rishivannan 6381370761 |

### Online — Esports/Gaming *(new category — not present in the original registration docx; separate entry fees, see §5)*

| Event | Format | Prize | Contact |
|---|---|---|---|
| E-Football ⚠️ | 1v1 & 2v2, knockout, 2-leg matches, 8-min matches | 1v1: W ₹1,000/R ₹500. 2v2: W ₹2,000/R ₹1,000 | Ram Balaji 8838755590, Nithish Kumar 8825476263 — **2v2 entry-fee unit disputed, see §14(h)** |
| FIFA | 1v1 knockout, PvP, penalties on draw | Winner ₹2,000 / Runner ₹1,000 | Dharani Vendhan 8438050809, Manjunatha 9345760744 |
| PUBG | Squad (4 main + 1 sub); 3 matches across 3 maps; points-based; min in-game level 25 | Winner ₹2,000 / Runner ₹1,000 | Kanish Krishnakanth 8148562050, Thirumaran 7904896669 |
| Free Fire | Team of 4; Battle Royale; min ID level 40; Android/iOS only | Winner ₹2,000 / Runner ₹1,000 | Chandrappradosh 8428788117, Nirai Muhil 9344633005 |

Note: Free Fire's rules explicitly state *"If minimum number of registration is not met in any event, then the event will be cancelled and the registration fees will be refunded"* — relevant to the refund-policy conflict in §14(a).

## 9. Eligibility

- General: **open to all medical colleges**, inter-collegiate.
- Sports (general rule): **only MBBS students, batches 2021–2026**; **postgraduates (PG) not allowed unless specified for that particular sport**. Two sports explicitly allow limited PGs: **Football** (UG + max 2 PGs/team) and **Futsal** (UG + max 1 PG/team). All other sports checked (Cricket, Basketball 5s/3s, Kabaddi) explicitly say UG-only/PG not allowed.
- Kabaddi specifically: UG only, 1st year through intern (no PG at all, stricter than the general sports rule).
- Culturals (general rule): **only MBBS students, batches 2021–2026, no postgraduates allowed** — no per-event exception found anywhere in the culturals section.
- Host college does not compete in its own sports tournament ("Host team will not participate in the tournament").
- ⚠️ The **registration form** in the original `content\Registration link content` docx lists **"PG"** as a selectable "year of study" option — this conflicts with the blanket "no PG" rule for culturals and most sports. See §14(b).

## 10. Rules

The 17-clause Terms & Conditions from `content\Terms and conditions\Untitled document.docx` remain in force (registration fees, ID card requirement, discipline, disqualification for misconduct, personal-belongings liability, property-damage liability, accommodation tied to food, prize amounts subject to change, first-come-first-served for limited slots, no liability for injury, follow organizer instructions, no alcohol/drugs/tobacco, zero tolerance for ragging/harassment, judges'/referees' decisions final, schedule/venue/rules changeable, and agreement-by-registering) — see the first-audit doc for the full verbatim list; it is reproduced unchanged in this pass since it was not contradicted, except for the refund clause (§14a).

The new brochure adds a fuller **accommodation policy**:
- Confirmed only through the registration link; all delegates wanting accommodation must register.
- A **refundable caution deposit of ₹100 per head** is paid at the registration desk on arrival.
- Accommodation is basic; buckets are provided (must be returned in good condition); **bed sheets and pillow covers are NOT provided**.
- Allotment is based on contingent size, arrival date, and duration of stay; mostly shared rooms/halls (**more than 10 people per room**), possibly shared with delegates from other colleges.
- Locks and keys provided; organizers not responsible for lost valuables/luggage.
- No smoking/alcohol/narcotics on campus (severe action for violation); teams may be denied/disqualified for misconduct; damage to college property is fined.
- Accommodation contacts: **Roshini Priya G — 7418878833**, **R.S. Ram Balaji — 8838755590**, **Mohamed Halith M — 7812809274**, **Sachita S — 9361231767**.

## 11. Contacts

| Role | Name(s) | Phone |
|---|---|---|
| Organising secretaries | Murugarassan | 9942904259 |
| | Pooja | 7695813823 |
| Registration desk | Adhithya Raja Rajan | 7806802451 |
| | Thirumaran | 7904896669 |
| Treasuries | Thanuja H | 7397371406 |
| | Jaiya Rishvanth R.K | 9150893622 |
| Accommodation | Roshini Priya G | 7418878833 |
| | R.S. Ram Balaji | 8838755590 |
| | Mohamed Halith M | 7812809274 |
| | Sachita S | 9361231767 |
| Sports secretaries | Sandeep Iniyan S | 6383223778 |
| | Deepika P | 9498032288 |
| Cultural secretaries | Kulakeerthivasan K | 7092963831 |
| | Karthika Sri R | 9363308713 |
| General WhatsApp (from original registration docx) | — | +91 95660 36104 |
| Instagram | @affinity.kims | — |

Every individual sport/cultural/online event also has its own dedicated contact(s) — see the tables in §6, §7 and §8 rather than duplicating them here.

## 12. Deadlines

| Deadline | Applies to |
|---|---|
| **26/09/2026** | General "last date for submission of online entries" (stated in both the Sports and Culturals general-rules pages); also the specific submission date named for: Short Film, Traditional Dance track, Solo/Duet Singing karaoke, Replica video, Twinning audio, Group Dance MP3, Photography, Reels, Pencil Painting, Painting, Poetry (English/Tamil), Movie Scene Recreation, AI Poster, Movie Poster Recreation. |
| **3rd October** | Explicit date for **Adaptunes** (a Day-3 cultural event). |
| TBA | Football prelims date ("will be announced soon"); Badminton venue ("to be announced soon"). |

⚠️ **Inference, not a stated fact:** since Adaptunes is grouped under "Day‑3" and is explicitly dated 3rd October, and the fest is described elsewhere as running three days, it is plausible the festival runs **around 1–3 October 2026** — but only 3rd October (tied to one Day‑3 event) is actually stated anywhere in the source materials. Day‑1 and Day‑2 calendar dates, and the overall festival start/end dates, are **not stated** and must not be presented as confirmed. Flagged as **[VERIFY WITH ORGANIZER]**.

## 13. Important restrictions

- **No refund** stated as the general registration rule ("No amount will be refunded at any cost") — but see the conflict in §14(a).
- Zero tolerance for smoking, alcohol, narcotics anywhere on campus/venue (sports, culturals, and accommodation rules all repeat this).
- Anti-ragging/harassment/bullying/discrimination policy, with immediate disciplinary action.
- Decency/anti-vulgarity requirements across performance events (Heels and Capes, Replica, Parody, Group Dance, Dub in Live, Channel Surfing, Short Film) — obscenity or vulgarity disqualifies.
- **No AI-generated content** allowed in: Short Film, Movie Scene Recreation, English Poetry, Tamil Poetry (plagiarism/AI use = immediate disqualification). This is the **opposite** of the **AI Poster** event, which explicitly *requires* AI-generated art with credited tools/prompts — an intentional category-specific difference, not a conflict.
- **Bot likes / artificial engagement banned** across every Instagram-likes-judged online event (Photography, Reels, Pencil Painting, Painting, AI Poster) — leads to disqualification.
- Esports: emulators, cheat tools (aimbot/trigger bot/ESP), and unauthorized game modification are banned and disqualify.
- No liability for participants' personal belongings, injuries, or accidents arising from participant negligence.
- Host college is excluded from competing in its own sports tournament.
- Stage-messing substances (oil, water, glitter, snow spray, confetti) are banned across multiple stage/dance events.

## 14. Conflicting information

a) **Refund policy.** `Terms and conditions/Untitled document.docx` (original, first audit): *"Registration fees once paid are strictly non-refundable and non-transferable unless if the event is cancelled."* The new brochure's general registration rules state flatly: *"No amount will be refunded at any cost"* — no stated exception. Yet the brochure's own **Free Fire** rules say: *"If minimum number of registration is not met in any event, then the event will be cancelled and the registration fees will be refunded."* Three different statements on the same topic. **[VERIFY WITH ORGANIZER]**

b) **PG eligibility.** The original registration-form docx lists "PG" as a selectable year-of-study option. The brochure's general eligibility rules say cultural events have **no PG allowed at all**, and sports **PG not allowed unless specified per sport** (only Football/Futsal name a PG allowance). It's unclear whether the registration form's "PG" option is meant only for the sports that allow it, or is simply a stale/generic field. **[VERIFY WITH ORGANIZER]**

c) **Online-events bundle scope.** The ₹100 online-events bundle is described as *"inclusive of Photography, Reels, Memes, Painting, English Poetry, Tamil Poetry, Pes"* — verbatim, confirmed against the actual brochure page image, not just text extraction. "Memes" does not correspond to any named event anywhere else in the 182-page brochure, and "Pes" is visibly cut off/incomplete in the source artwork itself (not a text-extraction artifact). **[VERIFY WITH ORGANIZER]** what these two list entries are actually meant to say (e.g. "Pes" may be a truncated "Pencil [Painting]", already listed separately as "Painting" — unclear if Pencil Painting is meant to be included in this bundle or is a duplicate/separate ₹100 charge; also unclear whether Movie Scene Recreation, AI Poster and Movie Poster Recreation — which appear in the same "Online events" brochure section — are covered by this ₹100 bundle or are separately priced, since they aren't named in the inclusion list at all).

d) **Resolved (no longer a conflict):** the original registration docx's ambiguous cultural event name "solal vel" is confirmed by the brochure to be **"Sollal Vel"**, a Day‑1 Tamil oratory event. The brochure spelling is adopted as canonical.

e) **Resolved (no longer a conflict):** the original registration docx's confusing "Chess(only chess not applicable)" note is explained by the brochure: Chess-only participants pay a separate ₹250 fee instead of the general registration package.

f) **Not a conflict, but a completeness gap:** the original registration docx's "Online (culturals only)" list (9 items) does not mention the esports/gaming category (E-Football, FIFA, PUBG, Free Fire) that the new brochure documents in full, with its own fee structure. The brochure is the more complete and authoritative source for the Online events category overall.

g) **(Added Phase 35) Track & Field group contact attribution.** The brochure and this document's own prior data agree that all four Track & Field records (Athletics — Track, Javelin Throw, Discus Throw, Shot Put) share the same 4 contacts: Kanishkar, Sharan Kumar, Hareni AS, Vanathy. One of the two Phase 35 supplementary documents instead narrows this to 2 contacts per event — Hareni AS for Track and Shot Put, Sharan Kumar for Discus and Javelin — omitting Kanishkar and Vanathy entirely from all four. The fuller, brochure-corroborated 4-contact list is what's kept as the primary record (§6), but the narrower attribution is not discarded. **[VERIFY WITH ORGANIZER]**

h) **(Added Phase 35) E-Football 2v2 entry-fee unit.** The brochure and this document's own prior data state the 2v2 fee as ₹150 per team. One of the two Phase 35 supplementary documents instead states ₹150 per person for the same 2v2 entry. Both readings are preserved in §5/§8 rather than one being silently chosen. **[VERIFY WITH ORGANIZER]**

i) **(Added Phase 35) Sollal Vel finalist-advancement fee.** This document previously recorded the fee for the 6 finalists to advance as ₹350. Both Phase 35 supplementary documents state ₹380 for the same fee. This is a correction against this document's own prior figure rather than a disagreement between the two new sources (which agree with each other) — corrected to ₹380 in §5/§7, with the prior ₹350 figure recorded here for traceability. **[VERIFY WITH ORGANIZER]**

## 15. Information requiring organizer verification

- Exact calendar dates for Day‑1 and Day‑2 of the festival (only Day‑3 = 3rd October is stated).
- Overall festival opening/closing dates and venue/campus address (repeatedly "to be announced").
- Football prelims date; Badminton venue.
- The refund-policy conflict in §14(a).
- The PG-eligibility conflict in §14(b).
- The online-bundle scope ambiguity ("Memes"/"Pes") in §14(c), and whether Movie Scene Recreation / AI Poster / Movie Poster Recreation fall under that ₹100 bundle or are priced separately.
- The fee amount for a replacement Affinity tag ("a separate amount will be charged" — no figure given).
- Whether entry to sports/culturals beyond the ones with a named fee (Chess, Track & Field, Short Film) is covered by the base ₹480/1,100/1,500 registration package, or requires a further per-event fee not documented anywhere.
- (Added Phase 31.) How a Chess-only registrant's real payment should reconcile with the frontend's displayed total, now that the UI intentionally shows only the flat package price rather than the brochure's ₹250 Chess-only override — see the "Frontend display note" under §5.
- Garbled contact number for Parody's second contact ("Sangavi S" — digits render inconsistently across the source as "7604...9575...65"; needs a clean number from the organizer).
- Whether the credited "Dhruvaas Tech Team" (Abiragh, Harinee B, Kaviya B, Madhuri, Perarasan, Vaibhav) is meant for public-facing site credits or was internal-only brochure signage.
- Content of the 267 MB promo video (`content/Promo video/lv_0_20260707191624.mp4`) has not been reviewed frame-by-frame; it may contain additional on-screen facts (dates, venue) not yet captured here.
- (Added Phase 35.) The Track & Field group's contact attribution conflict in §14(g).
- (Added Phase 35.) The E-Football 2v2 entry-fee unit conflict in §14(h).
- (Added Phase 35.) The Sollal Vel finalist-advancement fee correction in §14(i) — confirm ₹380 is correct before it's treated as final.

## 16. Participating colleges

Source: a separate 86-entry official college list document (supplied during
the college-searchable-dropdown phase; not part of the original brochure/
registration-docx set §1–15 above draw from). Transcribed verbatim,
programmatically (each source paragraph copied character-for-character,
not manually retyped), into `data/colleges.ts` — the sole source for the
registration wizard's College Name field (`CollegeCombobox`). Count and
1–86 sequence integrity are enforced at load time by that file itself (a
thrown error, not just a comment, if either ever drifts).

Three names look similar at a glance but are three separate entries in
the source, kept as three separate entries here: "Karpaga Vinayaga
Institute of Medical Sciences" (this project's own host institution —
note the "Vinayaga" spelling, distinct from the two below), "Vinayaka
Missions Kirupananda Variyar Medical College & Hospitals", and "Vinayaka
Missions Medical College, Karaikal". Likewise "Dhanalakshmi Srinivasan
Institute of Medical Sciences and Hospital, Perambalur" and "Dhanalakshmi
Srinivasan Medical College & Hospital, Perambalur" are two separate
Perambalur institutions in the source, both kept.
