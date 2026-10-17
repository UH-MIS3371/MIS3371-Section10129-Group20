"use strict";

// MIS 3371 - Team 20 - Patient Referral Management System
// Week 8: local application logic for the "submit a patient referral" transaction.
// Run it through the test file: node backend/test-backend.js
// There is NO web server, API, frontend connection, AWS, or database this week.
//
// Trust boundary: the incoming referral is untrusted input. The browser checks
// in app/app.js only help the user and can be bypassed, so every rule below is
// checked again here, on its own.
//
// Rules enforced here (IDs match docs/business-rules-states.md):
//   Rule A  Validation          BR-1, BR-9  required fields, ID formats, reason, date
//   Rule B  Duplicate blocking  BR-3        one active referral per patient + service
//   Rule C  Routing             BR-2, BR-7  department for the service, review window for urgency

// BR-2: each service maps to exactly one receiving department.
// The keys are the <option value="..."> strings in app/index.html.
const SERVICE_DEPARTMENTS = {
  "cardiology": "Cardiology Dept",
  "dermatology": "Dermatology Dept",
  "orthopedics": "Orthopedics Dept",
  "physical-therapy": "Physical Therapy Dept"
};

// BR-7: business days a referral may stay Under Review before it is overdue.
const REVIEW_WINDOW_BUSINESS_DAYS = {
  "urgent": 1,
  "routine": 3
};

// Same formats as the pattern attributes in app/index.html.
const PATIENT_ID_FORMAT = /^PAT-[0-9]{5}$/;
const PROVIDER_ID_FORMAT = /^DR-[0-9]{4}$/;

const REASON_MAX_LENGTH = 500;
const EARLIEST_REFERRAL_DATE = "2020-12-01";

// Today as YYYY-MM-DD in local time, the same format as <input type="date">.
function getTodayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

// A well-shaped string can still be an impossible date, such as 2026-02-31.
// Parse it and compare the calendar parts to catch automatic rollover.
function isRealCalendarDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(value + "T00:00:00.000Z");
  if (Number.isNaN(parsed.getTime())) return false;
  const parts = value.split("-").map(Number);
  return parsed.getUTCFullYear() === parts[0] &&
         parsed.getUTCMonth() + 1 === parts[1] &&
         parsed.getUTCDate() === parts[2];
}

// One failure shape for every rejection.
function reject(rule, message) {
  return { success: false, rule: rule, message: message, persisted: false };
}

// Demo IDs only. Real referral IDs come from the database in a later week.
let demoSequence = 0;
function createDemoReferralId() {
  demoSequence += 1;
  return "REF-DEMO-" + String(demoSequence).padStart(6, "0");
}

// Input: one plain referral object, plus the list of currently active referrals
// (a stand-in for the database). Output: one structured result object.
// The backend has no access to document or the browser.
function processReferral(referral, activeReferrals) {
  const active = Array.isArray(activeReferrals) ? activeReferrals : [];

  if (referral === null || typeof referral !== "object" || Array.isArray(referral)) {
    return reject("BR-1", "A referral object is required.");
  }

  // ---- Rule A: validation (BR-1, BR-9) ----
  // Strings only: never convert a number or object into an ID or reason.
  if (typeof referral.patientId !== "string" ||
      !PATIENT_ID_FORMAT.test(referral.patientId.trim())) {
    return reject("BR-1", "Patient ID is required in the format PAT-00000.");
  }
  const patientId = referral.patientId.trim();

  if (typeof referral.referringProviderId !== "string" ||
      !PROVIDER_ID_FORMAT.test(referral.referringProviderId.trim())) {
    return reject("BR-1", "Referring provider ID is required in the format DR-0000.");
  }
  const referringProviderId = referral.referringProviderId.trim();

  if (!isRealCalendarDate(referral.referralDate)) {
    return reject("BR-1", "Enter a valid referral date (YYYY-MM-DD).");
  }
  // Validated YYYY-MM-DD strings compare correctly as text.
  if (referral.referralDate > getTodayString()) {
    return reject("BR-9", "Referral date cannot be in the future.");
  }
  if (referral.referralDate < EARLIEST_REFERRAL_DATE) {
    return reject("BR-1", "Referral date cannot be before " + EARLIEST_REFERRAL_DATE + ".");
  }

  if (typeof referral.requestedService !== "string" ||
      !Object.prototype.hasOwnProperty.call(SERVICE_DEPARTMENTS, referral.requestedService)) {
    return reject("BR-2", "Select a service that a department offers.");
  }
  const requestedService = referral.requestedService;

  if (typeof referral.urgency !== "string" ||
      !Object.prototype.hasOwnProperty.call(REVIEW_WINDOW_BUSINESS_DAYS, referral.urgency)) {
    return reject("BR-1", "Urgency must be urgent or routine.");
  }
  const urgency = referral.urgency;

  if (typeof referral.referralReason !== "string" || referral.referralReason.trim() === "") {
    return reject("BR-1", "Reason for referral is required.");
  }
  const referralReason = referral.referralReason.trim();
  if (referralReason.length > REASON_MAX_LENGTH) {
    return reject("BR-1", "Reason for referral cannot be longer than " + REASON_MAX_LENGTH + " characters.");
  }

  // ---- Rule B: no duplicate active referral (BR-3) ----
  // Patient + service together. Same patient, different service is allowed.
  const duplicate = active.find(function (existing) {
    return existing.patientId === patientId &&
           existing.requestedService === requestedService;
  });
  if (duplicate) {
    return reject("BR-3",
      "This patient already has an active referral for this service (" +
        duplicate.referralId + ").");
  }

  // ---- Rule C: routing (BR-2, BR-7) ----
  // Reached only by a valid, non-duplicate referral. Urgent is not invalid;
  // it only shortens the review window.
  const receivingDepartment = SERVICE_DEPARTMENTS[requestedService];
  const reviewWindowBusinessDays = REVIEW_WINDOW_BUSINESS_DAYS[urgency];

  // Do not trust any incoming referralId, status, receivingDepartment,
  // overdueFlag, or submittedAt. The application tier derives them here.
  return {
    success: true,
    message: "Validated locally: routed to " + receivingDepartment +
      " with a " + reviewWindowBusinessDays + " business day review window. Not saved.",
    referralId: createDemoReferralId(),
    status: "Submitted",
    submittedAt: new Date().toISOString(),
    persisted: false,
    receivingDepartment: receivingDepartment,
    reviewWindowBusinessDays: reviewWindowBusinessDays,
    referral: {
      patientId: patientId,
      referringProviderId: referringProviderId,
      referralDate: referral.referralDate,
      requestedService: requestedService,
      urgency: urgency,
      referralReason: referralReason
    }
  };
}

module.exports = { processReferral, getTodayString, isRealCalendarDate };
