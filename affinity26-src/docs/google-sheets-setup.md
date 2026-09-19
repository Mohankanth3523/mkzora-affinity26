> **UPDATE (Phase 45): the browser no longer calls Apps Script directly.** A direct call fails with a CORS error
> (Apps Script sends no `Access-Control-Allow-Origin`). The frontend now POSTs to `/affinity26/api/register`, a
> Cloudflare Pages Function that forwards to the `/exec` URL kept in the server-side secret
> `GOOGLE_APPS_SCRIPT_ENDPOINT`. The Apps Script code and deployment below are **unchanged**; the deployment must still
> be *Execute as: Me* / *Who has access: Anyone*. Wherever this document says `NEXT_PUBLIC_REGISTRATION_ENDPOINT`, read
> `GOOGLE_APPS_SCRIPT_ENDPOINT` as a Cloudflare secret. Setup, local testing and deployment: the root `README.md`.
>
> **UPDATE (Phase 51): permanent duplicate protection.** The script below now rejects a registration when its normalised
> mobile number OR email address already exists anywhere in the `Registrations` sheet (messages: "This mobile number is
> already registered." / "This email address is already registered."). It replaces the old 2-minute same-submission retry
> handling. After pasting the script into the Apps Script editor, create a NEW VERSION of the existing deployment
> (Deploy -> Manage deployments -> Edit -> Version: New version -> Deploy) so the same `/exec` URL runs the new code.

# AFFINITY '26 — Google Sheets registration backend: setup guide

Persisted for continuity, and for whoever (organizer or future session)
actually sets this up. Phase 41 replaced the old frontend-only "Demo
Payment" step with a real, lightweight backend: a Google Sheet plus a
Google Apps Script Web App, called directly from the browser. No
database, no Next.js API route, no server of any kind is part of this
repository — see `docs/backend-integration-map.md` and
`docs/phase-41-confirm-registration-google-sheets-notes.md` for how this
fits the rest of the frontend-only architecture.

**This document contains no private credentials.** Nothing here needs
one: the only thing the frontend is ever given is a Web App URL, which is
not a secret (see "Security," below).

## 1. Create the Google Sheet

Create a new, blank Google Sheet (sheets.new). Name it whatever the
organizer wants — this document doesn't assume a fixed spreadsheet name,
only the worksheet (tab) name below.

**This has already been done for AFFINITY '26**, so you don't need to
create a new one: the spreadsheet is **`Registration_students`**, owned
by **iammohankanth@gmail.com**. Open that existing sheet and skip ahead
to section 2.

## 2. Create the "Registrations" worksheet

Rename the sheet's first tab (or add a new tab) to exactly `Registrations`
— the Apps Script below reads/writes this sheet by that exact name.

## 3. Add the header row

In row 1 of `Registrations`, enter these thirteen headers, in this exact
column order (A through M):

| Column | Header |
|---|---|
| A | Registration ID |
| B | Timestamp |
| C | Full Name |
| D | College Name |
| E | Year of Study |
| F | Phone |
| G | Email |
| H | Selected Events |
| I | Event Count |
| J | Package |
| K | Registration Amount |
| L | Submission Status |
| M | Source |

This matches the phase brief's own column spec exactly. The script below
assumes row 1 is this header row and starts appending data at row 2.

## 4. Open Extensions → Apps Script

From the Sheet, go to **Extensions → Apps Script**. Delete whatever
placeholder code is in `Code.gs` and paste in the script from section 5
below.

## 5. The Apps Script

```javascript
/**
 * AFFINITY '26 registration intake — Google Apps Script Web App.
 *
 * Paired with lib/registration/submitRegistration.ts in the frontend
 * repo. Receives one POST per registration submission, validates it,
 * recomputes the registration amount itself from the submitted package
 * name (never trusts a frontend-sent amount), generates a sequential
 * registration ID under a script lock, appends exactly one row, and
 * returns a small JSON response.
 *
 * PERMANENT DUPLICATE PROTECTION (Phase 51): a mobile number can be registered only once and an email address can be
 * registered only once. Every existing row of the Registrations sheet is checked (normalised), inside the script lock,
 * BEFORE a registration ID is generated or a row is appended.
 *
 * Deliberately NOT using doOptions()/CORS headers — see "Why no CORS
 * headers" in docs/google-sheets-setup.md's companion notes. The
 * frontend sends its POST with Content-Type: text/plain so the browser
 * never sends a preflight OPTIONS request in the first place; this
 * script never needs to answer one.
 */

/** Shown by doGet so you can verify which code the active Web App deployment is running. */
var SCRIPT_VERSION = "duplicate-protection-v2";

var SHEET_NAME = "Registrations";
var ID_PREFIX = "AF26-";
var ID_DIGITS = 5;

/** Package label (exactly as the frontend sends it) -> the one true, server-side price. Never trust a client-sent amount — this map is the sole source of truth for what each package costs. */
var PACKAGE_AMOUNTS = {
  "Registration": 480,
  "Registration + Food": 1100,
  "Registration + Food + Accommodation": 1500,
};

/** Registrations sheet columns (1-based) — F = phone, G = email. Unchanged sheet structure. */
var PHONE_COLUMN = 6;
var EMAIL_COLUMN = 7;

var DUPLICATE_PHONE_MESSAGE = "This mobile number is already registered.";
var DUPLICATE_EMAIL_MESSAGE = "This email address is already registered.";

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    var body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return respond({ success: false, message: "Malformed request body." });
    }

    var validation = validatePayload(body);
    if (!validation.ok) {
      return respond({ success: false, message: validation.message });
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return respond({ success: false, message: "Registrations sheet not found." });
    }

    // Server-side amount recomputation — the whole point of doing this
    // server-side at all. Whatever `amount` the frontend sent is IGNORED
    // entirely; only the package label is trusted, and only to look up
    // the one correct price for it.
    var amount = PACKAGE_AMOUNTS[body.package];

    // Permanent duplicate check across ALL existing registrations — a phone number and an email address can each be
    // used only once. It runs before nextRegistrationId() and appendRow(), so a rejected registration consumes no ID
    // and adds no row. The lock taken above serialises concurrent submissions, so two simultaneous requests with the
    // same phone/email cannot both pass this check.
    var duplicateField = findDuplicateContact(sheet, body);
    if (duplicateField === "phone") {
      return respond({ success: false, message: DUPLICATE_PHONE_MESSAGE });
    }
    if (duplicateField === "email") {
      return respond({ success: false, message: DUPLICATE_EMAIL_MESSAGE });
    }

    var registrationId = nextRegistrationId(sheet);
    var timestamp = new Date();

    sheet.appendRow([
      registrationId,
      timestamp,
      body.fullName,
      body.collegeName,
      body.yearOfStudy,
      body.phone,
      body.email,
      body.selectedEvents,
      body.eventCount,
      body.package,
      amount,
      "CONFIRMED",
      "AFFINITY '26 Website",
    ]);
    SpreadsheetApp.flush(); // make the new row visible to the next (lock-serialised) request's duplicate check

    return respond({
      success: true,
      registrationId: registrationId,
      message: "Registration confirmed",
    });
  } catch (err) {
    // Never expose internal error details to the participant — log for
    // the organizer, return a generic message to the client.
    console.error(err);
    return respond({ success: false, message: "Registration could not be recorded. Please try again." });
  } finally {
    lock.releaseLock();
  }
}

/** Optional diagnostic — lets you confirm the deployment is live by visiting the Web App URL directly in a browser. Returns no registration data. */
function doGet(e) {
  // `version` lets you confirm in a browser that the ACTIVE deployment runs the duplicate-protection code.
  return respond({ success: true, message: "AFFINITY '26 registration endpoint is live.", version: SCRIPT_VERSION });
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function validatePayload(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Missing request body." };
  }
  if (!isNonEmptyString(body.fullName)) {
    return { ok: false, message: "Full name is required." };
  }
  if (!isNonEmptyString(body.collegeName)) {
    return { ok: false, message: "College name is required." };
  }
  if (!isNonEmptyString(body.yearOfStudy)) {
    return { ok: false, message: "Year of study is required." };
  }
  if (!isNonEmptyString(body.phone)) {
    return { ok: false, message: "Phone number is required." };
  }
  if (!isNonEmptyString(body.email) || body.email.indexOf("@") === -1) {
    return { ok: false, message: "A valid email address is required." };
  }
  if (!isNonEmptyString(body.selectedEvents) || !body.eventCount || body.eventCount < 1) {
    return { ok: false, message: "At least one event must be selected." };
  }
  if (!PACKAGE_AMOUNTS.hasOwnProperty(body.package)) {
    return { ok: false, message: "A valid package must be selected." };
  }
  return { ok: true };
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Sequential registration ID, guarded by the caller's script lock so two
 * concurrent submissions can never receive the same ID. Reads the last
 * row's own ID and increments its numeric suffix; starts at 1 for an
 * empty (header-only) sheet.
 */
function nextRegistrationId(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return ID_PREFIX + "00001";
  }
  var lastId = String(sheet.getRange(lastRow, 1).getValue());
  var match = lastId.match(/(\d+)$/);
  var nextNumber = match ? parseInt(match[1], 10) + 1 : lastRow; // lastRow fallback only if column A was ever hand-edited into an unexpected shape
  var padded = String(nextNumber);
  while (padded.length < ID_DIGITS) {
    padded = "0" + padded;
  }
  return ID_PREFIX + padded;
}

/**
 * Phone normalisation for duplicate detection. Keeps digits only (drops spaces, hyphens, parentheses, "+"), and if
 * more than 10 digits remain (country code such as 91 / 0091, or a leading 0) keeps the LAST 10 — the Indian mobile
 * number. Works for values Google Sheets stored as text ("+91 88389-35124") or converted to a number (8838935124).
 */
function normalizePhone(value) {
  var digits = String(value === null || value === undefined ? "" : value).replace(/\D/g, "");
  if (digits.length > 10) {
    digits = digits.slice(-10);
  }
  return digits;
}

/** Email normalisation for duplicate detection: string, trimmed, lower-cased. */
function normalizeEmail(value) {
  return String(value === null || value === undefined ? "" : value).trim().toLowerCase();
}

/**
 * Permanent duplicate check. Scans EVERY existing row (not just recent ones) and returns "phone" if the normalised
 * phone already exists, else "email" if the normalised email already exists, else null. Phone takes precedence when
 * both match. Existing rows are only read — never modified or deleted.
 */
function findDuplicateContact(sheet, body) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  var phone = normalizePhone(body.phone);
  var email = normalizeEmail(body.email);
  var rows = sheet.getRange(2, PHONE_COLUMN, lastRow - 1, EMAIL_COLUMN - PHONE_COLUMN + 1).getValues();

  var phoneFound = false;
  var emailFound = false;
  for (var i = 0; i < rows.length; i++) {
    if (phone && normalizePhone(rows[i][0]) === phone) {
      phoneFound = true;
      break; // phone takes precedence; no need to look further
    }
    if (email && normalizeEmail(rows[i][1]) === email) {
      emailFound = true; // keep scanning: a later row may still match the phone
    }
  }
  return phoneFound ? "phone" : emailFound ? "email" : null;
}
```

## 6. Deploy as Web App

In the Apps Script editor: **Deploy → New deployment**. Choose type
**Web app**.

## 7. Execute as the spreadsheet owner

Set **Execute as** to **Me (iammohankanth@gmail.com)** — the script must
run with the Sheet owner's own permission to write to the Sheet,
regardless of who is submitting the form. This is what lets a participant
with no Google account of their own still successfully submit a
registration. Apps Script fills this field in with whichever Google
account is currently editing the script — since `Registration_students`
is owned by `iammohankanth@gmail.com`, deploying from that same signed-in
account is what makes "Me" resolve to the right owner. There is nothing
else to configure here — no separate credential, key, or account picker.

## 8. Set access for the registration website

Set **Who has access** to **Anyone** — Apps Script's terminology for "no
Google sign-in required to call this Web App," i.e. anyone who needs to
submit a registration from the public AFFINITY '26 website, signed in to
Google or not. This does **not** give the public any access to the
underlying Sheet itself — only to this one script's `doPost`/`doGet`
functions, which only ever append a row through the validated logic
above. It's the standard access level for a public form-submission
endpoint like this one.

## 9. Copy the Web App URL

After deploying, Apps Script shows a URL shaped like
`https://script.google.com/macros/s/AKfycb.../exec`. Copy it.

## 10. Add it to the frontend configuration

Set it as `NEXT_PUBLIC_REGISTRATION_ENDPOINT` in the frontend's
environment — locally in `.env.local` (see `.env.example`), and in
whatever the Cloudflare Pages project's build-environment-variable
settings are for production. See
`lib/registration/submissionConfig.ts` for the one place this repo reads
it.

Whenever the script is edited later, Apps Script requires **Deploy →
Manage deployments → Edit → New version** (or a fresh deployment) for the
change to actually take effect on the existing Web App URL — saving the
script alone does not update a live deployment.

## Why `Content-Type: text/plain`, not `application/json`

`lib/registration/submitRegistration.ts` POSTs with
`Content-Type: "text/plain;charset=utf-8"`, not
`"application/json"`, even though the body is a JSON string. This is
deliberate, not an oversight: Google Apps Script Web Apps don't implement
`doOptions()` (CORS preflight handling). A JSON `Content-Type` on a POST
with a body counts as a "non-simple" request under the Fetch/CORS spec,
so the browser would send an `OPTIONS` preflight request first — which
Apps Script has no handler for, so the browser would report a CORS
failure before the actual POST ever reached `doPost()` at all.
`"text/plain"` is one of the CORS-safelisted "simple request" content
types, so the browser sends the POST directly, no preflight, no CORS
headers needed on the Apps Script side. The Apps Script's `doPost(e)`
function still reads the raw request body as text
(`e.postData.contents`) and calls `JSON.parse()` on it itself —
completely independent of what `Content-Type` header the browser
declared — so the payload still arrives and parses as ordinary JSON. This
is the standard, widely-documented working pattern for browser → Apps
Script Web App submissions.

**Not live-verified in this project.** This sandbox has no outbound
network access to Google's APIs, so this exact request/response pair has
not been tested against a real deployed Apps Script endpoint as part of
this phase's work — see
`docs/phase-41-confirm-registration-google-sheets-notes.md` for this
flagged as an open item. The pattern itself (text/plain POST body
containing JSON, parsed with `JSON.parse(e.postData.contents)` on the
Apps Script side) is a long-established, commonly-used one for exactly
this browser-to-Apps-Script situation — but "commonly used elsewhere"
is not the same claim as "verified working in this deployment," and
whoever deploys this should do the manual test in the next section before
trusting it in production.

## Testing (do this before trusting the deployment)

**Do this before ever pointing the real frontend at the Web App URL.**
First, visit the Web App URL directly in a browser (a plain `GET`) and
confirm the `doGet` diagnostic response —
`{"success":true,"message":"AFFINITY '26 registration endpoint is
live."}` — appears. That's the fastest way to confirm the deployment
itself is live before testing `doPost`. Then work through each case
below with `curl` (or Postman), substituting `<your Web App URL>` with
the real URL from section 9. Run them in order — several later cases
depend on a successful row from case 1 already existing.

### 1. Valid registration

```bash
curl -X POST "<your Web App URL>" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{
    "fullName": "Test Participant",
    "collegeName": "Test College",
    "yearOfStudy": "2nd Year",
    "phone": "9999999999",
    "email": "test@example.com",
    "selectedEvents": "Cricket | Chess",
    "eventCount": 2,
    "package": "Registration + Food",
    "amount": 1,
    "source": "manual test"
  }'
```

Expected: `{"success":true,"registrationId":"AF26-00001", ...}` (or the
next sequential number if the sheet already has rows). Confirm in the
sheet: a new row appears in `Registrations` with `Registration Amount` =
**1100** — not the `"amount": 1` the request body tried to send, proving
the server-side recomputation works — `Submission Status` = `CONFIRMED`,
and `Source` = `AFFINITY '26 Website`, with `Registration ID` and
`Timestamp` both filled in by the script itself.

### 2. Missing name

Same payload as case 1, with `"fullName": ""` (or the key removed
entirely). Expected: `{"success":false,"message":"Full name is
required."}`. No row is added.

### 3. Missing college

Same payload as case 1, with `"collegeName": ""`. Expected:
`{"success":false,"message":"College name is required."}`. No row is
added.

### 4. Missing email

Same payload as case 1, with `"email": ""`. Expected:
`{"success":false,"message":"A valid email address is required."}`. No
row is added. (An `email` present but missing an `@`, e.g. `"not-an-
email"`, hits the same check and the same message.)

### 5. Invalid package

Same payload as case 1, with `"package": "VIP Package"` (anything not
exactly one of the three valid labels). Expected:
`{"success":false,"message":"A valid package must be selected."}`. No
row is added — this confirms the script rejects unrecognized package
values instead of silently recording a `0` or `undefined` amount.

### 6. Incorrect frontend amount

Same payload as case 1, but change only `"amount"` to something wrong,
e.g. `"amount": 50`, while keeping `"package": "Registration + Food"`.
Expected: `{"success":true, ...}` (this is a *valid* registration — the
amount field is simply never trusted) and the new row's `Registration
Amount` column reads **1100**, the correct server-computed price for
"Registration + Food," never the `50` the request sent. This is the
core "never trust a browser-supplied amount" guarantee — verify it
explicitly, not just in passing during case 1.

### 7. Multiple simultaneous submissions

Fire several distinct registrations at once (different `email`/`phone`
each, so they're not caught by the duplicate check) to confirm
`LockService` prevents two submissions from ever receiving the same
Registration ID:

```bash
for i in 1 2 3 4 5; do
  curl -s -X POST "<your Web App URL>" \
    -H "Content-Type: text/plain;charset=utf-8" \
    -d "{\"fullName\":\"Concurrent Test $i\",\"collegeName\":\"Test College\",\"yearOfStudy\":\"1st Year\",\"phone\":\"90000000$i\",\"email\":\"concurrent$i@example.com\",\"selectedEvents\":\"Chess\",\"eventCount\":1,\"package\":\"Registration\",\"amount\":1,\"source\":\"manual test\"}" &
done
wait
```

Expected: five distinct `{"success":true,"registrationId":"AF26-..."}`
responses, no two sharing the same ID, and five new rows in the sheet
with consecutive, non-repeating Registration IDs. (`LockService.
waitLock(30000)` means a submission can wait up to 30 seconds for the
lock rather than fail outright under this kind of burst — five requests
is a light enough load that none should time out.)

### 8. Duplicate-submission check (bonus, not in the original list but worth verifying)

Re-send the exact case-1 payload again within two minutes. Expected: the
**same** registration ID as case 1 comes back, `"message":"This
registration was already recorded."`, and **no** second row is added —
confirming a participant whose connection drops after a successful
submission but before the response arrives won't accidentally double-
register by retrying.

### Cleanup

Rows created by this testing section are real rows in
`Registration_students`. Delete the test rows (everything with
`Test College`, `Test Participant`, or `Concurrent Test *` in it) before
treating the sheet as a clean slate for real registrations — the Apps
Script itself never deletes or overwrites rows (see "Important," above),
so this is a manual step.

**Not live-verified in this project.** This sandbox has no outbound
network access to Google's APIs, so none of the eight cases above have
actually been run against a real deployed endpoint as part of this
document's own writing — see
`docs/phase-41-confirm-registration-google-sheets-notes.md` for this
flagged as an open item. The Apps Script's logic has been read closely
against each case and each does correspond to a real branch in the code
above (see `validatePayload`, `PACKAGE_AMOUNTS`, `findRecentDuplicate`,
and the `LockService` wrapping in `doPost`) — but "the code should do
this" is not the same claim as "verified doing this in a live
deployment." Whoever deploys this should run all eight cases themselves
before pointing the real frontend at the URL.

## Cloudflare Pages environment variable configuration

The frontend reads the Web App URL from `NEXT_PUBLIC_REGISTRATION_ENDPOINT`
at **build time** — Next.js inlines every `NEXT_PUBLIC_*` variable into
the static JavaScript bundle when `next build` runs (see `next.config.mjs`'s
`output: "export"`), so setting or changing this variable never takes
effect on its own; it only takes effect the next time Cloudflare Pages
runs a build.

1. In the Cloudflare dashboard, open the Pages project for this site.
2. Go to **Settings → Environment variables**.
3. Add a variable named exactly `NEXT_PUBLIC_REGISTRATION_ENDPOINT`, with
   the Web App URL from section 9 as its value.
4. Set it for **both** the **Production** and **Preview** environments
   (two separate entries, or Cloudflare's "apply to all environments"
   option if offered) — a Preview deployment without the variable set
   will otherwise silently fall back to `submitRegistration.ts`'s
   `"not-configured"` error path, even though Production is fine.
5. Click **Save**.
6. **Trigger a new deployment** — either push a new commit, or use
   Cloudflare's "Retry deployment" / "Create deployment" action on the
   latest commit. Saving the environment variable by itself does **not**
   rebuild the already-deployed static bundle; the variable only reaches
   the live site once a build runs after it was added.
7. After that deployment finishes, verify: open the live site's
   registration flow in a private/incognito window (to rule out any
   locally-cached old bundle), reach Step 06 (Confirm), and confirm the
   button is enabled and doesn't show the "isn't configured yet for this
   environment" error banner.

If the Web App URL is ever redeployed to a new version under **Deploy →
Manage deployments → Edit → New version**, the URL itself stays the same
(Apps Script Web App URLs are stable across "new version" deployments of
the same deployment), so no Cloudflare Pages change or rebuild is needed
for that case — only a genuinely new deployment (a different URL) would
require repeating this section.

## Troubleshooting

- **Site shows "Registration submission isn't configured yet for this
  environment."** `NEXT_PUBLIC_REGISTRATION_ENDPOINT` is missing, or was
  added/changed but the site hasn't been rebuilt since. See "Cloudflare
  Pages environment variable configuration" above — this variable is
  baked in at build time, not read at runtime.
- **Browser console shows a CORS error / "blocked by CORS policy."**
  Almost always one of two causes: (1) something changed
  `submitRegistration.ts`'s request to send `Content-Type:
  application/json` instead of `text/plain;charset=utf-8` — see "Why
  `Content-Type: text/plain`, not `application/json`" above for why that
  matters; or (2) the Apps Script deployment's **Who has access** isn't
  set to **Anyone** (see section 8) — a "Google Workspace only" or
  similarly restricted setting causes the browser's request to be
  redirected to a Google sign-in page, which itself surfaces as a CORS
  failure rather than a clear permission error.
- **The response is an HTML page (a Google sign-in / "you need
  permission" page), not JSON.** This is the same root cause as the CORS
  case above — the deployment's access level isn't actually "Anyone," or
  "Execute as" isn't "Me." Re-check section 7 and 8's settings under
  **Deploy → Manage deployments**, and make sure you're looking at the
  currently-active deployment, not a stale earlier one.
- **Sheet doesn't update even though the frontend/curl shows
  `"success":true`.** Confirm the worksheet tab is named exactly
  `Registrations` (case-sensitive, no trailing space) — `doPost`
  silently returns a `"Registrations sheet not found."` failure response
  if the tab was renamed or the script is bound to the wrong spreadsheet.
  Also confirm the script is bound to `Registration_students` itself
  (opened via that Sheet's own **Extensions → Apps Script**, not a
  freestanding script project).
- **Duplicate rows appear for what should have been one submission.**
  Most likely an old deployment is still being called. Every **New
  version** under **Deploy → Manage deployments → Edit** keeps the same
  URL, but if a *second, separate* Web App deployment was ever created
  (rather than editing the existing one), two different URLs now exist
  and could both be receiving traffic from different builds. Check
  **Deploy → Manage deployments** for more than one **active** Web app
  deployment and remove/archive the one that isn't the URL configured in
  Cloudflare Pages.
- **Registration IDs aren't sequential, or reset to `AF26-00001`
  unexpectedly.** `nextRegistrationId()` reads the last row's own ID in
  column A and increments its numeric suffix — if row 1's header text was
  edited, a row was manually inserted/deleted in a way that left column A
  blank on the actual last row, or the header row itself was deleted,
  the script's "what was the last ID" logic can be thrown off. Don't
  hand-edit column A of existing rows, and don't insert manual rows
  between the header and the script's own appended rows.
- **A request times out or intermittently fails under load.** `doPost`
  waits up to 30 seconds for `LockService`'s lock
  (`lock.waitLock(30000)`) before giving up — under genuinely heavy
  simultaneous traffic a request could still exceed that window. This is
  a reasonable limit for a college fest's registration volume, but if it
  becomes a real problem, that number is the one place to reconsider (at
  the cost of slower responses on the frontend for the requests that do
  wait).
- **Something else entirely.** Apps Script's own **Executions** log
  (visible from the Apps Script editor's left sidebar) shows every
  `doPost`/`doGet` call, its result, and any thrown error — including the
  ones `doPost`'s own `catch` block deliberately hides from the client
  response (to avoid leaking internals to participants). That log is the
  first place to look for anything not covered above.

## Security

- No Google service-account key, private key, OAuth client secret, or any
  other credential appears anywhere in this document, the Apps Script
  above, or the frontend codebase. There is nothing to keep secret on the
  frontend side of this integration.
- The only frontend configuration is the public Web App URL
  (`NEXT_PUBLIC_REGISTRATION_ENDPOINT`) — see `.env.example`'s own
  comment for why embedding this in the client bundle is safe.
- The spreadsheet ID itself is never exposed to the frontend or embedded
  in any client-visible code — the Apps Script reads
  `SpreadsheetApp.getActiveSpreadsheet()`, which resolves implicitly from
  the deployment's own binding, not from any ID passed in by the client.
- The Web App runs "as me" (the Sheet owner) specifically so that no
  participant needs their own Google account or any elevated permission
  to submit a registration — the access control that matters is "what can
  the deployed script's own code do," not "who is calling it," and the
  script above only ever validates input and appends one row.
