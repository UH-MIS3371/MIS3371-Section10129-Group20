// MIS 3371 - Team 20 - Patient Referral Management System
// Week 7: browser-side validation and business-rule behavior.
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
const SAMPLE_ACTIVE_REFERRALS = [
  { referralId: "REF-2026-004821", patientId: "PAT-88213", requestedService: "cardiology" },
  { referralId: "REF-2026-004905", patientId: "PAT-10452", requestedService: "orthopedics" }
];


// ---------------------------------------------------------
// PAGE ELEMENTS
// ---------------------------------------------------------

const form = document.querySelector("#referralForm");
const patientIdInput = document.querySelector("#patientId");
const referralDateInput = document.querySelector("#referralDate");
const serviceSelect = document.querySelector("#requestedService");
const urgencySelect = document.querySelector("#urgency");

const dateMessage = document.querySelector("#dateMessage");
const duplicateMessage = document.querySelector("#duplicateMessage");
const routingMessage = document.querySelector("#routingMessage");
const formMessage = document.querySelector("#formMessage");
const departmentMessage = document.querySelector("#departmentMessage");


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

  if (isFutureDate(dateValue)) {
    showMessage(dateMessage, "Referral date cannot be in the future.", "error");
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

  const duplicate = findActiveDuplicate(patientId, serviceValue);

  if (duplicate) {
    showMessage(
      duplicateMessage,
      "This patient already has an active referral for this service: " +
        duplicate.referralId + ".",
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

function handleSubmit(event) {
  // No backend yet, so stay on the page for the Week 7 demo.
  // The browser has already checked required fields and patterns
  // before this function runs.
  event.preventDefault();

  // BR-9: validation. Stop if the date is in the future.
  if (isFutureDate(referralDateInput.value)) {
    showMessage(formMessage,
      "Cannot submit: the referral date cannot be in the future.",
      "error");
    referralDateInput.focus();
    return;
  }

  // BR-3: conditional business rule using two fields together.
  const duplicate = findActiveDuplicate(
    patientIdInput.value.trim(),
    serviceSelect.value
  );

  if (duplicate) {
    showMessage(formMessage,
      "Cannot submit: this patient already has an active referral for this service (" +
        duplicate.referralId + ").",
      "error");
    patientIdInput.focus();
    return;
  }

  // All browser-side checks passed.
  const department = getReceivingDepartment(serviceSelect.value);
  const reviewWindow = requiresPriorityRouting(urgencySelect.value)
    ? "1 business day"
    : "3 business days";

  showMessage(formMessage,
    "Client-side checks passed. This referral would be routed to " +
      department + " for review within " + reviewWindow + ".",
    "success");
}


// ---------------------------------------------------------
// SETUP + EVENT LISTENERS
// ---------------------------------------------------------

// BR-9 native constraint: the date picker will not allow future dates.
referralDateInput.max = getTodayString();

patientIdInput.addEventListener("input", handlePatientInput);
referralDateInput.addEventListener("change", handleDateChange);
serviceSelect.addEventListener("change", handleServiceChange);
urgencySelect.addEventListener("change", handleUrgencyChange);
form.addEventListener("submit", handleSubmit);
