// MIS 3371 - Team 20 - Patient Referral Management System
// Week 7: browser-side validation and business-rule behavior.
// Week 10: a valid referral is sent to the AWS API (POST /referrals).
//
// Rules shown in the browser:
//   BR-2  Route only to the department that offers the requested service
//   BR-3  No duplicate active referral for the same patient + service
//   BR-7  Urgent = 1 business day review window, Routine = 3
//   BR-9  Referral date cannot be in the future
//
// Important: browser JavaScript only helps the user. The application/server
// tier must enforce these same rules again later, because browser code can
// be changed or bypassed.


// ---------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------

const URGENT_VALUE = "urgent";

// BR-2: each service maps to exactly one receiving department.
const SERVICE_DEPARTMENTS = {
  "cardiology": "Cardiology Dept",
  "dermatology": "Dermatology Dept",
  "orthopedics": "Orthopedics Dept",
  "physical-therapy": "Physical Therapy Dept"
};

// BR-3 demo data: referrals that are already active (not Rejected,
// Completed, or Cancelled). There is no database yet, so this small
// fictional list stands in for it. Week 10 replaces it with DynamoDB.
// A referral that passes the browser checks is added here, so submitting
// the same patient + service again in the same session is blocked.
const SAMPLE_ACTIVE_REFERRALS = [
  { referralId: "REF-2026-004821", patientId: "PAT-88213", requestedService: "cardiology" },
  { referralId: "REF-2026-004905", patientId: "PAT-10452", requestedService: "orthopedics" }
];

// Week 10: the API Gateway invoke URL plus our route.
// Replace the address with YOUR API's invoke URL from API Gateway.
const API_URL = "https://722iiz2wzk.execute-api.us-east-1.amazonaws.com/api/expenses";


// ---------------------------------------------------------
// PAGE ELEMENTS
// ---------------------------------------------------------

const form = document.querySelector("#referralForm");
const patientIdInput = document.querySelector("#patientId");
const referralDateInput = document.querySelector("#referralDate");
const serviceSelect = document.querySelector("#requestedService");
const urgencySelect = document.querySelector("#urgency");
const reasonInput = document.querySelector("#referralReason");

const dateMessage = document.querySelector("#dateMessage");
const duplicateMessage = document.querySelector("#duplicateMessage");
const routingMessage = document.querySelector("#routingMessage");
const formMessage = document.querySelector("#formMessage");
const departmentMessage = document.querySelector("#departmentMessage");
const submitButton = form.querySelector('button[type="submit"]');


// ---------------------------------------------------------
// BUSINESS / VALIDATION FUNCTIONS
// ---------------------------------------------------------

// Today's date as YYYY-MM-DD in the user's local time zone.
function getTodayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

// BR-9: dates in YYYY-MM-DD format compare correctly as strings.
function isFutureDate(dateString) {
  return dateString > getTodayString();
}

// BR-2
function getReceivingDepartment(serviceValue) {
  return SERVICE_DEPARTMENTS[serviceValue] || "";
}

// BR-3: returns the matching active referral, or undefined if none.
function findActiveDuplicate(patientId, serviceValue) {
  return SAMPLE_ACTIVE_REFERRALS.find(function (referral) {
    return referral.patientId === patientId &&
           referral.requestedService === serviceValue;
  });
}

// BR-7
function requiresPriorityRouting(urgencyValue) {
  return urgencyValue === URGENT_VALUE;
}


// ---------------------------------------------------------
// PASS/FAIL VALIDATION CHECKS
// One rule, two uses: live feedback AND the submit gate call
// these same checks, so each condition is written only once.
// ---------------------------------------------------------

// BR-9: true when the referral date is today or earlier.
function referralDateSatisfied(dateString) {
  return !isFutureDate(dateString);
}

// BR-1: the reason must contain real text. The native `required` attribute
// accepts a value made only of spaces, so the trimmed text is checked too.
// maxlength only limits typing, so the 500-character cap is checked here too.
const REASON_MAX_LENGTH = 500;

function reasonSatisfied(reasonText) {
  const trimmed = reasonText.trim();
  return trimmed !== "" && trimmed.length <= REASON_MAX_LENGTH;
}

// BR-3: true when there is NO active referral for this patient + service.
function duplicateRuleSatisfied(patientId, serviceValue) {
  return !findActiveDuplicate(patientId, serviceValue);
}


// ---------------------------------------------------------
// MESSAGE HELPER
// ---------------------------------------------------------

// type is "error", "success", "info", or "" to clear.
function showMessage(element, text, type) {
  element.textContent = text;
  element.className = type ? "message message--" + type : "message";
}

// Any change after a passed check means the form must be checked again.
function clearFormMessage() {
  showMessage(formMessage, "", "");
}


// ---------------------------------------------------------
// LIVE FEEDBACK
// ---------------------------------------------------------

function updateDateMessage() {
  const dateValue = referralDateInput.value;

  if (dateValue === "") {
    showMessage(dateMessage, "", "");
    return;
  }

  if (!referralDateSatisfied(dateValue)) {
    showMessage(dateMessage,
      "Referral date cannot be in the future. Choose today or an earlier date.",
      "error");
  } else {
    showMessage(dateMessage, "", "");
  }
}

function updateDepartment() {
  const department = getReceivingDepartment(serviceSelect.value);

  if (department === "") {
    showMessage(departmentMessage, "", "");
  } else {
    showMessage(departmentMessage,
      "This referral will be routed to " + department + ".",
      "info");
  }
}

function updateDuplicateMessage() {
  const patientId = patientIdInput.value.trim();
  const serviceValue = serviceSelect.value;

  // Only check once both values are filled in and the ID format is valid.
  if (patientId === "" || serviceValue === "" || !patientIdInput.checkValidity()) {
    showMessage(duplicateMessage, "", "");
    return;
  }

  if (!duplicateRuleSatisfied(patientId, serviceValue)) {
    const duplicate = findActiveDuplicate(patientId, serviceValue);
    showMessage(
      duplicateMessage,
      "This patient already has an active referral for this service (" +
        duplicate.referralId + "). Pick a different service or check the existing referral.",
      "error"
    );
  } else {
    showMessage(duplicateMessage, "", "");
  }
}

function updateRoutingMessage() {
  const urgencyValue = urgencySelect.value;

  if (urgencyValue === "") {
    showMessage(routingMessage, "", "");
    return;
  }

  if (requiresPriorityRouting(urgencyValue)) {
    showMessage(routingMessage,
      "Urgent referrals are flagged as overdue after 1 business day in review.",
      "info");
  } else {
    showMessage(routingMessage,
      "Routine referrals are flagged as overdue after 3 business days in review.",
      "info");
  }
}


// ---------------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------------

function handlePatientInput() {
  updateDuplicateMessage();
  clearFormMessage();
}

function handleDateChange() {
  updateDateMessage();
  clearFormMessage();
}

function handleServiceChange() {
  updateDepartment();
  updateDuplicateMessage();
  clearFormMessage();
}

function handleUrgencyChange() {
  updateRoutingMessage();
  clearFormMessage();
}

async function handleSubmit(event) {
  // Stay on the page; JavaScript sends the referral to the API instead.
  // The browser has already checked required fields and patterns
  // before this function runs.
  event.preventDefault();

  const patientId = patientIdInput.value.trim();
  const serviceValue = serviceSelect.value;

  // BR-9: validation. Stop if the date is in the future.
  if (!referralDateSatisfied(referralDateInput.value)) {
    showMessage(formMessage,
      "Cannot submit: the referral date cannot be in the future. Choose today or an earlier date.",
      "error");
    referralDateInput.focus();
    return;
  }

  // BR-1: the reason cannot be blank or only spaces.
  if (!reasonSatisfied(reasonInput.value)) {
    showMessage(formMessage,
      "Cannot submit: enter a reason for the referral (1 to 500 characters).",
      "error");
    reasonInput.focus();
    return;
  }

  // BR-3: conditional business rule using two fields together.
  if (!duplicateRuleSatisfied(patientId, serviceValue)) {
    const duplicate = findActiveDuplicate(patientId, serviceValue);
    showMessage(formMessage,
      "Cannot submit: this patient already has an active referral for this service (" +
        duplicate.referralId + "). Pick a different service or check the existing referral.",
      "error");
    patientIdInput.focus();
    return;
  }

  // The six fields the backend expects (same keys as the data dictionary).
  const referral = {
    patientId: patientId,
    referringProviderId: form.querySelector("#referringProviderId").value.trim(),
    referralDate: referralDateInput.value,
    requestedService: serviceValue,
    urgency: urgencySelect.value,
    referralReason: reasonInput.value.trim()
  };

  // Reduce accidental repeated clicks while the HTTP request is in flight.
  submitButton.disabled = true;
  clearFormMessage();
  showMessage(formMessage, "Sending referral to the AWS API...", "info");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(referral)
    });

    // fetch() gives us a Response object. .json() parses its JSON body.
    const result = await response.json();

    // The backend (Lambda) is authoritative: show what it decided.
    if (!response.ok || !result.success) {
      showMessage(formMessage,
        "Not accepted: " + (result.message || "the referral was rejected."),
        "error");
      return;
    }

    // Remember the accepted referral so the browser's BR-3 check applies to it.
    SAMPLE_ACTIVE_REFERRALS.push({
      referralId: result.referralId,
      patientId: patientId,
      requestedService: serviceValue
    });

    // Clear the form and its live messages for the next referral.
    form.reset();
    showMessage(dateMessage, "", "");
    showMessage(departmentMessage, "", "");
    showMessage(duplicateMessage, "", "");
    showMessage(routingMessage, "", "");

    showMessage(formMessage,
      "Accepted by the API. Referral " + result.referralId +
        " is routed to " + result.receivingDepartment + " for review within " +
        result.reviewWindowBusinessDays + " business day(s). Nothing is saved yet.",
      "success");
  } catch (error) {
    // Network problem, wrong URL, or CORS not enabled on the API.
    console.error("Referral request failed:", error);
    showMessage(formMessage,
      "Could not reach the referral API. Check your connection and try again.",
      "error");
  } finally {
    submitButton.disabled = false;
  }
}


// ---------------------------------------------------------
// SETUP + EVENT LISTENERS
// ---------------------------------------------------------

// BR-9 native constraint: the date picker will not allow future dates.
// The max is refreshed whenever the date field is used, so a page left
// open past midnight does not keep yesterday's limit.
function refreshDateLimit() {
  referralDateInput.max = getTodayString();
}
refreshDateLimit();
referralDateInput.addEventListener("focus", refreshDateLimit);

patientIdInput.addEventListener("input", handlePatientInput);
referralDateInput.addEventListener("change", handleDateChange);
serviceSelect.addEventListener("change", handleServiceChange);
urgencySelect.addEventListener("change", handleUrgencyChange);
form.addEventListener("submit", handleSubmit);
