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
