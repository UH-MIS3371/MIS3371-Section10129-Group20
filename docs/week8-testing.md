# Week 8: Local Backend Testing

The backend is the application-tier logic for our one transaction, **a referring provider submits a patient referral**. It lives in `backend/` and is not connected to the browser form yet.

Run from the repository root:

```bash
node backend/test-backend.js
```

`test-backend.js` calls `processReferral()` directly with sample referral objects, compares **expected** to **actual** result fields, prints PASS or FAIL for each case, and exits with a nonzero status if any case fails. It uses no third-party packages. Referral IDs and timestamps change on every call, so they are not compared.

## Rules enforced in `backend/backend.js`

The browser checks in `app/app.js` only help the user and can be bypassed, so the backend checks every rule again on its own.

| Rule | Business rules | What the backend does |
|---|---|---|
| A. Validation | BR-1, BR-9 | Rejects a missing or malformed `patientId` (`PAT-00000`) or `referringProviderId` (`DR-0000`), an impossible, future, or date before 2020-12-01, an unknown urgency, and a blank, whitespace-only, or over-500-character reason |
| B. Duplicate blocking | BR-3 | Rejects a referral when the same patient already has an active referral for the same service. The same patient with a different service is allowed |
| C. Routing | BR-2, BR-7 | Routes a valid referral only to the department that offers the service, and sets the review window: Urgent = 1 business day, Routine = 3 |

Urgent is a valid input that changes the review window. It is never an error. System fields (`referralId`, `status`, `receivingDepartment`, `submittedAt`) are produced by the backend and any values the caller sends for them are ignored.

## Test results

Results below come from running `node backend/test-backend.js --markdown`.

| # | Type | Case | Input | Expected | Actual | Result |
|---|---|---|---|---|---|---|
| 1 | Valid | Urgent cardiology referral for a new patient | PAT-12345, Cardiology, Urgent, today | Accepted, Cardiology Dept, 1 business day review, status Submitted | Accepted: Cardiology Dept, 1 business day review, status Submitted, persisted false | PASS |
| 2 | Valid | Routine orthopedics referral gets a 3 day window | PAT-12345, Orthopedics, Routine | Accepted, Orthopedics Dept, 3 business day review | Accepted: Orthopedics Dept, 3 business day review, status Submitted, persisted false | PASS |
| 3 | Valid | Same patient, different service is not a duplicate | PAT-88213, Dermatology (PAT-88213 only has Cardiology active) | Accepted, Dermatology Dept | Accepted: Dermatology Dept, 1 business day review, status Submitted, persisted false | PASS |
| 4 | Valid | Physical therapy routes to its own department | PAT-12345, Physical Therapy, Routine | Accepted, Physical Therapy Dept | Accepted: Physical Therapy Dept, 3 business day review, status Submitted, persisted false | PASS |
| 5 | Invalid | Duplicate active referral (BR-3) | PAT-88213, Cardiology (already active as REF-2026-004821) | Rejected (BR-3) | Rejected (BR-3): This patient already has an active referral for this service (REF-2026-004821). | PASS |
| 6 | Invalid | Future referral date (BR-9) | Referral date = tomorrow | Rejected (BR-9) | Rejected (BR-9): Referral date cannot be in the future. | PASS |
| 7 | Invalid | Patient ID in the wrong format | patientId = pat-12345 | Rejected (BR-1) | Rejected (BR-1): Patient ID is required in the format PAT-00000. | PASS |
| 8 | Invalid | Missing referring provider ID | referringProviderId = empty | Rejected (BR-1) | Rejected (BR-1): Referring provider ID is required in the format DR-0000. | PASS |
| 9 | Invalid | Service no department offers | requestedService = podiatry | Rejected (BR-2) | Rejected (BR-2): Select a service that a department offers. | PASS |
| 10 | Invalid | Urgency outside Urgent/Routine | urgency = asap | Rejected (BR-1) | Rejected (BR-1): Urgency must be urgent or routine. | PASS |
| 11 | Invalid | Impossible calendar date | referralDate = 2026-02-31 | Rejected (BR-1) | Rejected (BR-1): Enter a valid referral date (YYYY-MM-DD). | PASS |
| 12 | Invalid | No referral object at all | input = null | Rejected (BR-1) | Rejected (BR-1): A referral object is required. | PASS |
| 13 | Boundary | Referral date = today is the last valid date (BR-9) | Referral date = today | Accepted | Accepted: Cardiology Dept, 1 business day review, status Submitted, persisted false | PASS |
| 14 | Boundary | Referral date = tomorrow is the first blocked date (BR-9) | Referral date = today + 1 day | Rejected (BR-9) | Rejected (BR-9): Referral date cannot be in the future. | PASS |
| 15 | Boundary | Whitespace-only reason | referralReason = 4 spaces | Rejected (BR-1) | Rejected (BR-1): Reason for referral is required. | PASS |
| 16 | Boundary | Reason of exactly 500 characters | referralReason = 500 x 'a' | Accepted | Accepted: Cardiology Dept, 1 business day review, status Submitted, persisted false | PASS |
| 17 | Boundary | Reason of 501 characters | referralReason = 501 x 'a' | Rejected (BR-1) | Rejected (BR-1): Reason for referral cannot be longer than 500 characters. | PASS |
| 18 | Boundary | Patient ID one digit short | patientId = PAT-1234 | Rejected (BR-1) | Rejected (BR-1): Patient ID is required in the format PAT-00000. | PASS |
| 19 | Boundary | Earliest allowed date, 2020-12-01 | referralDate = 2020-12-01 | Accepted | Accepted: Cardiology Dept, 1 business day review, status Submitted, persisted false | PASS |
| 20 | Boundary | Day before earliest allowed date | referralDate = 2020-11-30 | Rejected (BR-1) | Rejected (BR-1): Referral date cannot be before 2020-12-01. | PASS |
| 21 | Edge | Caller cannot forge system fields | Input includes status=Accepted, referralId=FAKE, receivingDepartment=Cardiology Dept for a Dermatology referral | Accepted, Dermatology Dept, status Submitted | Accepted: Dermatology Dept, 1 business day review, status Submitted, persisted false | PASS |

21 passed, 0 failed (21 total).

**Boundary cases:** the referral date (today passes, tomorrow is blocked, and 2020-12-01 passes while 2020-11-30 is blocked), the reason length (500 passes, 501 is blocked, and spaces only is blocked), and the patient ID length (4 digits is blocked).

## What is not implemented in Week 8
- No API, HTTP server, `fetch()`, AWS, or database. Accepted results say `persisted: false` and "Not saved".
- The demo `referralId` (`REF-DEMO-000001`) is not a real referral ID and restarts at 1 each run.
- Duplicate checking uses a small fictional list passed into the function, standing in for the database.
- The remaining rules (BR-4 to BR-6 and BR-8, which cover state changes and roles) are not implemented yet.

## Manual consistency check
- [x] Field names match the form and data dictionary: `patientId`, `referringProviderId`, `referralDate`, `requestedService`, `urgency`, `referralReason`.
- [x] Service values match the `app/index.html` options: `cardiology`, `dermatology`, `orthopedics`, `physical-therapy`.
- [x] A rejected referral never receives a department or review window.
- [x] No server, `fetch()`, or AWS code was added.
