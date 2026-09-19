const vm = require("vm"), fs = require("fs");
const code = fs.readFileSync("Code.gs", "utf8");

function makeEnv(seedRows) {
  // Sheet emulation: like Google Sheets, appendRow turns numeric-looking strings into numbers.
  const rows = [["ID","Timestamp","Name","College","Year","Phone","Email","Events","Count","Package","Amount","Status","Source"], ...seedRows.map(r => r.slice())];
  const coerce = v => (typeof v === "string" && /^\d+$/.test(v) ? Number(v) : v);
  const sheet = {
    getLastRow: () => rows.length,
    getRange: (r, c, nr = 1, nc = 1) => ({
      getValues: () => rows.slice(r - 1, r - 1 + nr).map(row => row.slice(c - 1, c - 1 + nc)),
      getValue: () => rows[r - 1][c - 1],
    }),
    appendRow: (arr) => { rows.push(arr.map(coerce)); },
  };
  const ctx = {
    console, Date, JSON, Math, Number, String, parseInt,
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: (n) => (n === "Registrations" ? sheet : null) }), flush() {} },
    ContentService: { MimeType: { JSON: "json" }, createTextOutput: (t) => ({ t, setMimeType() { return this; } }) },
  };
  vm.createContext(ctx); vm.runInContext(code, ctx);
  const post = (over) => {
    const body = Object.assign({ fullName: "Test Person", collegeName: "Madras Medical College", yearOfStudy: "3rd Year", phone: "9000000001", email: "unique1@example.com", selectedEvents: "Cricket | Volleyball", eventCount: 2, package: "Registration", amount: 1, source: "AFFINITY '26 Website" }, over);
    return JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(body) } }).t);
  };
  const get = () => JSON.parse(ctx.doGet({}).t);
  return { rows, post, get };
}

// Existing test data: AF26-00001 / AF26-00002 share phone+email (phone stored as a NUMBER by Sheets, as in production)
const T = new Date();
const seed = [
  ["AF26-00001", T, "Mohan", "MMC", "3rd Year", 8838935124, "mohan@example.com", "Cricket", 1, "Registration", 480, "CONFIRMED", "AFFINITY '26 Website"],
  ["AF26-00002", T, "Mohan", "MMC", "3rd Year", 8838935124, "mohan@example.com", "Cricket", 1, "Registration", 480, "CONFIRMED", "AFFINITY '26 Website"],
];
const { rows, post } = makeEnv(seed);
let pass = 0, fail = 0;
const check = (name, cond, extra = "") => { (cond ? pass++ : fail++); console.log((cond ? "PASS " : "FAIL ") + name + (extra ? "  -> " + extra : "")); };
const PH = "This mobile number is already registered.", EM = "This email address is already registered.";
const nrows = () => rows.length;

console.log("--- 1. new phone + email");
let n0 = nrows(), r = post({ phone: "9000000001", email: "new1@example.com" });
check("new registration succeeds with AF26-00003", r.success === true && r.registrationId === "AF26-00003", JSON.stringify(r));
check("row appended, amount recomputed server-side (480, client sent 1)", nrows() === n0 + 1 && rows[rows.length - 1][10] === 480);

console.log("--- 2. same phone, different email");
n0 = nrows(); r = post({ phone: "8838935124", email: "different@example.com" });
check("rejected with phone message", r.success === false && r.message === PH && !r.registrationId, JSON.stringify(r));
check("no row created", nrows() === n0);

console.log("--- 3. different phone, same email");
n0 = nrows(); r = post({ phone: "9111111111", email: "mohan@example.com" });
check("rejected with email message", r.success === false && r.message === EM, JSON.stringify(r));
check("no row created", nrows() === n0);

console.log("--- 4. exact same phone + email");
n0 = nrows(); r = post({ phone: "8838935124", email: "mohan@example.com" });
check("rejected", r.success === false && (r.message === PH || r.message === EM), JSON.stringify(r));
check("no row created", nrows() === n0);

console.log("--- 5. phone formats of an existing number");
for (const p of ["+91 8838935124", "+918838935124", "8838935124", "88389 35124", "88389-35124", "(88389) 35124", "0091 88389 35124", "091-8838935124", "+91-88389-35124"]) {
  n0 = nrows(); r = post({ phone: p, email: "fmt" + Math.random().toString(36).slice(2) + "@example.com" });
  check(`phone "${p}" rejected`, r.success === false && r.message === PH && nrows() === n0);
}

console.log("--- 6. email capitalisation / spaces");
for (const em of ["Mohan@Example.com", "MOHAN@EXAMPLE.COM", "  mohan@example.com", "mohan@example.com  ", "  MoHaN@eXample.COM  "]) {
  n0 = nrows(); r = post({ phone: "9222222222", email: em });
  check(`email "${em}" rejected`, r.success === false && r.message === EM && nrows() === n0);
}

console.log("--- 7. IDs continue AF26-00004, 00005 (rejections consumed none)");
r = post({ phone: "9333333333", email: "new2@example.com" }); check("AF26-00004", r.success && r.registrationId === "AF26-00004", JSON.stringify(r));
r = post({ phone: "9444444444", email: "new3@example.com" }); check("AF26-00005", r.success && r.registrationId === "AF26-00005", JSON.stringify(r));

console.log("--- extras");
// a phone/email that a NEW registration used is now protected too, whichever format is used
r = post({ phone: "+91 90000 00001", email: "z@example.com" }); check("phone registered via the website (stored as number) also blocks +91 variant", r.success === false && r.message === PH);
r = post({ phone: "9555555555", email: "NEW1@example.com" }); check("email of a website registration blocks a different-case variant", r.success === false && r.message === EM);
// stored as TEXT with formatting in the sheet (e.g. hand-entered)
const e2 = makeEnv([["AF26-00001", T, "A", "B", "1", "+91 88389-35124", "  Mixed@Case.com ", "x", 1, "Registration", 480, "CONFIRMED", "s"]]);
let rr = e2.post({ phone: "8838935124", email: "other@x.com" }); check("text-formatted stored phone matches plain number", rr.success === false && rr.message === PH);
rr = e2.post({ phone: "9999999999", email: "mixed@case.com" }); check("text-formatted stored email matches", rr.success === false && rr.message === EM);
// scans ALL rows, not just the last 50
const big = []; for (let i = 1; i <= 200; i++) big.push(["AF26-" + String(i).padStart(5, "0"), T, "n", "c", "y", 7000000000 + i, `u${i}@ex.com`, "e", 1, "Registration", 480, "CONFIRMED", "s"]);
const e3 = makeEnv(big);
rr = e3.post({ phone: "7000000001", email: "fresh@ex.com" }); check("duplicate in row 1 of 200 detected (not just last 50)", rr.success === false && rr.message === PH);
rr = e3.post({ phone: "6999999999", email: "U2@ex.com" }); check("duplicate email in row 2 of 200 detected", rr.success === false && rr.message === EM);
rr = e3.post({ phone: "6999999999", email: "fresh@ex.com" }); check("fresh contact on a 200-row sheet succeeds with AF26-00201", rr.success && rr.registrationId === "AF26-00201", JSON.stringify(rr));
// doGet reports the version marker (how the organizer verifies the active deployment)
const gg = makeEnv([]).get(); check("doGet reports version duplicate-protection-v2", gg.success === true && gg.version === "duplicate-protection-v2");
// empty sheet
const e4 = makeEnv([]); rr = e4.post({}); check("empty sheet: first registration AF26-00001", rr.success && rr.registrationId === "AF26-00001");
// existing validation untouched
rr = e4.post({ email: "bad" }); check("existing validation still rejects invalid email", rr.success === false && /valid email/i.test(rr.message));
rr = e4.post({ package: "Nope", phone: "9666666666", email: "p@x.com" }); check("invalid package still rejected", rr.success === false);
// seed rows untouched
check("rows AF26-00001/2 unchanged", JSON.stringify(rows[1]) === JSON.stringify(seed[0]) && JSON.stringify(rows[2]) === JSON.stringify(seed[1]));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
