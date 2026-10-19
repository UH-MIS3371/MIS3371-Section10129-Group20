"use strict";

// MIS 3371 - Team 20 - Week 8: repeatable LOCAL backend tests (no testing package).
// From the repository root:  node backend/test-backend.js
// Markdown table of results: node backend/test-backend.js --markdown
// Each test states what we EXPECT before asking processReferral what ACTUALLY happens.

const { processReferral, getTodayString } = require("./backend");

// Stand-in for the database: referrals that are already active (BR-3).
// Same fictional sample data as app/app.js.
const ACTIVE_REFERRALS = [
  { referralId: "REF-2026-004821", patientId: "PAT-88213", requestedService: "cardiology" },
  { referralId: "REF-2026-004905", patientId: "PAT-10452", requestedService: "orthopedics" }
];

// A complete, valid referral. Each test overrides only the field(s) it checks.
function sampleReferral(changes) {
  return Object.assign({
    patientId: "PAT-12345",
    referringProviderId: "DR-4410",
    referralDate: getTodayString(),
    requestedService: "cardiology",
    urgency: "urgent",
    referralReason: "Chest pain on exertion"
  }, changes);
}

// Build dates relative to today so the tests never go stale.
function dateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return date.getFullYear() + "-" + month + "-" + day;
}

// category: Valid, Invalid, or Boundary. `describe` is the plain-language input.
// `expected` lists only the result fields that matter for the case. Referral
// IDs and timestamps change on every call, so they are never hard-coded.
const tests = [
  // ---- Valid ----
  { category: "Valid", name: "Urgent cardiology referral for a new patient",
    describe: "PAT-12345, Cardiology, Urgent, today",
    input: sampleReferral(),
    expected: { success: true, receivingDepartment: "Cardiology Dept", reviewWindowBusinessDays: 1, status: "Submitted", persisted: false } },
  { category: "Valid", name: "Routine orthopedics referral gets a 3 day window",
    describe: "PAT-12345, Orthopedics, Routine",
    input: sampleReferral({ requestedService: "orthopedics", urgency: "routine" }),
    expected: { success: true, receivingDepartment: "Orthopedics Dept", reviewWindowBusinessDays: 3 } },
  { category: "Valid", name: "Same patient, different service is not a duplicate",
    describe: "PAT-88213, Dermatology (PAT-88213 only has Cardiology active)",
    input: sampleReferral({ patientId: "PAT-88213", requestedService: "dermatology" }),
    expected: { success: true, receivingDepartment: "Dermatology Dept" } },
  { category: "Valid", name: "Physical therapy routes to its own department",
    describe: "PAT-12345, Physical Therapy, Routine",
    input: sampleReferral({ requestedService: "physical-therapy", urgency: "routine" }),
    expected: { success: true, receivingDepartment: "Physical Therapy Dept" } },

  // ---- Invalid ----
  { category: "Invalid", name: "Duplicate active referral (BR-3)",
    describe: "PAT-88213, Cardiology (already active as REF-2026-004821)",
    input: sampleReferral({ patientId: "PAT-88213" }),
    expected: { success: false, rule: "BR-3" } },
  { category: "Invalid", name: "Future referral date (BR-9)",
    describe: "Referral date = tomorrow",
    input: sampleReferral({ referralDate: dateOffset(1) }),
    expected: { success: false, rule: "BR-9" } },
  { category: "Invalid", name: "Patient ID in the wrong format",
    describe: "patientId = pat-12345",
    input: sampleReferral({ patientId: "pat-12345" }),
    expected: { success: false, rule: "BR-1" } },
  { category: "Invalid", name: "Missing referring provider ID",
    describe: "referringProviderId = empty",
    input: sampleReferral({ referringProviderId: "" }),
    expected: { success: false, rule: "BR-1" } },
  { category: "Invalid", name: "Service no department offers",
    describe: "requestedService = podiatry",
    input: sampleReferral({ requestedService: "podiatry" }),
    expected: { success: false, rule: "BR-2" } },
  { category: "Invalid", name: "Urgency outside Urgent/Routine",
    describe: "urgency = asap",
    input: sampleReferral({ urgency: "asap" }),
    expected: { success: false, rule: "BR-1" } },
  { category: "Invalid", name: "Impossible calendar date",
    describe: "referralDate = 2026-02-31",
    input: sampleReferral({ referralDate: "2026-02-31" }),
    expected: { success: false, rule: "BR-1" } },
  { category: "Invalid", name: "No referral object at all",
    describe: "input = null",
    input: null,
    expected: { success: false, rule: "BR-1" } },

  // ---- Boundary / edge ----
  { category: "Boundary", name: "Referral date = today is the last valid date (BR-9)",
    describe: "Referral date = today",
    input: sampleReferral({ referralDate: dateOffset(0) }),
    expected: { success: true } },
  { category: "Boundary", name: "Referral date = tomorrow is the first blocked date (BR-9)",
    describe: "Referral date = today + 1 day",
    input: sampleReferral({ referralDate: dateOffset(1) }),
    expected: { success: false, rule: "BR-9" } },
  { category: "Boundary", name: "Whitespace-only reason",
    describe: "referralReason = 4 spaces",
    input: sampleReferral({ referralReason: "    " }),
    expected: { success: false, rule: "BR-1" } },
  { category: "Boundary", name: "Reason of exactly 500 characters",
    describe: "referralReason = 500 x 'a'",
    input: sampleReferral({ referralReason: "a".repeat(500) }),
    expected: { success: true } },
  { category: "Boundary", name: "Reason of 501 characters",
    describe: "referralReason = 501 x 'a'",
    input: sampleReferral({ referralReason: "a".repeat(501) }),
    expected: { success: false, rule: "BR-1" } },
  { category: "Boundary", name: "Patient ID one digit short",
    describe: "patientId = PAT-1234",
    input: sampleReferral({ patientId: "PAT-1234" }),
    expected: { success: false, rule: "BR-1" } },
  { category: "Boundary", name: "Earliest allowed date, 2020-12-01",
    describe: "referralDate = 2020-12-01",
    input: sampleReferral({ referralDate: "2020-12-01" }),
    expected: { success: true } },
  { category: "Boundary", name: "Day before earliest allowed date",
    describe: "referralDate = 2020-11-30",
    input: sampleReferral({ referralDate: "2020-11-30" }),
    expected: { success: false, rule: "BR-1" } },

  // ---- Trust boundary ----
  { category: "Edge", name: "Caller cannot forge system fields",
    describe: "Input includes status=Accepted, referralId=FAKE, receivingDepartment=Cardiology Dept for a Dermatology referral",
    input: sampleReferral({ requestedService: "dermatology", status: "Accepted", referralId: "FAKE", receivingDepartment: "Cardiology Dept", submittedAt: "2000-01-01" }),
    expected: { success: true, status: "Submitted", receivingDepartment: "Dermatology Dept" } }
];

// Compare only the fields named in `expected`.
const results = [];
for (const test of tests) {
  const actual = processReferral(test.input, ACTIVE_REFERRALS);
  const mismatches = [];
  for (const [field, expectedValue] of Object.entries(test.expected)) {
    if (actual[field] !== expectedValue) {
      mismatches.push(field + ": expected " + JSON.stringify(expectedValue) + ", got " + JSON.stringify(actual[field]));
    }
  }
  if (test.name === "Caller cannot forge system fields") {
    if (actual.referralId === "FAKE") mismatches.push("referralId was copied from untrusted input");
    if (actual.submittedAt === "2000-01-01") mismatches.push("submittedAt was copied from untrusted input");
  }
  results.push({ test, actual, mismatches, ok: mismatches.length === 0 });
}

const passed = results.filter(function (r) { return r.ok; }).length;
const failed = results.length - passed;

// Short, readable form of what was actually returned.
function summarize(actual) {
  if (!actual.success) return "Rejected (" + actual.rule + "): " + actual.message;
  return "Accepted: " + actual.receivingDepartment + ", " + actual.reviewWindowBusinessDays +
    " business day review, status " + actual.status + ", persisted " + actual.persisted;
}

function summarizeExpected(expected) {
  if (expected.success === false) return "Rejected (" + expected.rule + ")";
  const parts = ["Accepted"];
  if (expected.receivingDepartment) parts.push(expected.receivingDepartment);
  if (expected.reviewWindowBusinessDays) parts.push(expected.reviewWindowBusinessDays + " business day review");
  if (expected.status) parts.push("status " + expected.status);
  return parts.join(", ");
}

if (process.argv.includes("--markdown")) {
  console.log("| # | Type | Case | Input | Expected | Actual | Result |");
  console.log("|---|---|---|---|---|---|---|");
  results.forEach(function (r, index) {
    console.log("| " + (index + 1) + " | " + r.test.category + " | " + r.test.name + " | " +
      r.test.describe + " | " + summarizeExpected(r.test.expected) + " | " +
      summarize(r.actual) + " | " + (r.ok ? "PASS" : "FAIL") + " |");
  });
  console.log("\n" + passed + " passed, " + failed + " failed (" + results.length + " total).");
} else {
  results.forEach(function (r) {
    console.log((r.ok ? "PASS" : "FAIL") + " - [" + r.test.category + "] " + r.test.name);
    console.log("  Input:    " + r.test.describe);
    console.log("  Expected: " + summarizeExpected(r.test.expected));
    console.log("  Actual:   " + summarize(r.actual));
    if (!r.ok) console.log("  Differences: " + r.mismatches.join("; "));
  });
  console.log("\nWeek 8 test summary: " + passed + " passed, " + failed + " failed (" + results.length + " total).");
}

// A nonzero exit code makes a failure visible to any future automation.
if (failed > 0) process.exitCode = 1;
