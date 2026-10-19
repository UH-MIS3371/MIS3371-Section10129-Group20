# TPS_3371_TEAM_20 — Patient Referral Management System

**Course:** MIS 3371 — Capstone Project
**Current release:** Milestone 2 (client-side system) and Week 8 (local backend)

## Project Purpose
Clinics send patient referrals by phone, fax, paper, and email. Coordinators re-key the details, chase missing information, and decide by hand which department should receive each referral. Referrals get lost, the same patient can be referred twice for the same service, and providers and patients cannot see where a referral stands.

This project builds a **Patient Referral Management System** that handles one transaction: a referring provider **submits a patient referral**, and the system validates it, routes it to the correct receiving department, and tracks it to a final status.

## Scenario
A referring provider submits a referral for a patient to receive a specific service. The system checks required fields and blocks duplicate active referrals, assigns a referral ID, and routes the referral to the department that offers the service. The receiving department accepts it, rejects it with a reason, or requests more information. Every status change is recorded with a timestamp so the provider and referral coordinator can see where it stands.

All demo data is fictional — no real patient information is used.

## Team
| Name | Role |
|---|---|
| Peter | Team Lead / PM |
| Daja | Requirements & Documentation Lead |
| Sophia | Systems Analyst / Design Lead |
| Elizabeth | Development & Git Lead |
| Yoki | QA / Testing Lead |

## Repository Structure
```
TPS_3371_TEAM_20/
├── README.md
├── Performance_Tracker.xlsx
├── docs/
│   ├── team-charter.md
│   ├── business-problem-scope.md
│   ├── stakeholders.md
│   ├── main-transaction.md
│   ├── requirements.md
│   ├── user-stories-acceptance.md
│   ├── business-rules-states.md
│   ├── traceability-matrix.md
│   ├── week8-testing.md              (backend rules and test results)
│   └── data-dictionary.html
├── diagrams/
│   ├── architecture-v1.html          (three tiers + responsibility notes)
│   ├── state_transaction_workflow.html (state diagram, state definitions, and transitions)
│   └── transaction_workflow.html     (workflow diagram and worksheet)
├── app/
│   ├── index.html                    (referral form)
│   ├── styles.css
│   └── app.js
├── backend/
│   ├── backend.js                    (processReferral: validation, duplicate check, routing)
│   └── test-backend.js               (21 named test cases, expected vs. actual)
└── archive/                          (superseded drafts, kept for history)
```

## Milestone 2 Browser Tests

Open `app/index.html` in a browser and fill every field. Sample active referrals in `app.js`: `PAT-88213` + Cardiology (`REF-2026-004821`) and `PAT-10452` + Orthopedics (`REF-2026-004905`). A referral that passes is added to that list for the rest of the page session. Reloading the page resets it.

Actual results were recorded by running each input in Chrome (desktop width) on 2026-10-17. All 14 passed.

| # | Test | Input | Expected result | Actual result | Pass |
|---|---|---|---|---|---|
| 1 | Date boundary: today | Referral date = today | Passes (BR-9 allows today) | Success message with demo ID and Cardiology Dept | Yes |
| 2 | Date boundary: tomorrow | Referral date = tomorrow | Blocked: "Referral date cannot be in the future. Choose today or an earlier date." | Blocked before submit (date picker `max` = today) | Yes |
| 3 | Duplicate referral | `PAT-88213` + Cardiology | Blocked at submit: shows `REF-2026-004821`; cursor moves to Patient ID (BR-3) | Error naming `REF-2026-004821` | Yes |
| 4 | Same patient, different service | `PAT-88213` + Dermatology | Passes: only the same patient + same service is a duplicate | Success, routed to Dermatology Dept | Yes |
| 5 | New patient | `PAT-12345` + Cardiology + Urgent | Passes: routed to Cardiology Dept, review within 1 business day (BR-2, BR-7) | Success, Cardiology Dept, 1 business day | Yes |
| 6 | Urgency changes the path | Routine instead of Urgent | Message changes from 1 to 3 business days; the referral is still valid (BR-7) | Success, Orthopedics Dept, 3 business days | Yes |
| 7 | Department routing | Pick each service | Message names the matching department (BR-2) | Cardiology, Dermatology, Orthopedics, and Physical Therapy each routed to their own department | Yes |
| 8 | Resubmit after success | Submit test 5 again | Blocked as a duplicate of the referral just created (BR-3) | Error naming the demo ID created by the first submit | Yes |
| 9 | Form resets after success | Submit a valid referral | Fields clear for the next referral | All fields empty | Yes |
| 10 | Whitespace-only reason | Reason = spaces | Blocked: reason is required (BR-1) | "Cannot submit: enter a reason for the referral (1 to 500 characters)." | Yes |
| 11 | Reason over 500 characters | Reason = 501 characters | Blocked (BR-1) | Same reason error | Yes |
| 12 | Patient ID one digit short | `PAT-1234` | Blocked by the field pattern (BR-1) | Blocked before submit | Yes |
| 13 | Patient ID in lowercase | `pat-12345` | Blocked by the field pattern (BR-1) | Blocked before submit | Yes |
| 14 | Date before the minimum | `2020-11-30` | Blocked by the date minimum | Blocked before submit | Yes |

Test 2 is the main boundary test: today is the last valid date, so tomorrow is the first blocked value. Layout was also checked at 360 px wide (single column) and 1200 px wide (three columns).

## Week 8: Local Backend

`backend/backend.js` holds the application-tier logic for the same transaction. It checks the rules again on its own, because browser code can be bypassed. It is not connected to the form yet.

```bash
node backend/test-backend.js
```

21 cases (valid, invalid, boundary, and a forged-field edge case) all pass. See `docs/week8-testing.md` for the rules, the full expected-vs-actual table, and what is not implemented.

## Key Distinctions
- **Workflow vs. state:** the workflow shows actions and decisions ("department reviews referral"); the state shows what is true now ("Under Review").
- **Validation vs. business rule:** validation asks whether a value is usable (a future referral date is not); a business rule decides what happens because of a value (a duplicate active referral is blocked).
- **Referral ID vs. status:** `referralId` identifies the referral and never changes; `status` changes as the referral moves through the workflow.

## Git Workflow
Pull before starting · one focused branch per task · pull request with one reviewer before merging to `main` · wait for the author to say "ready" before merging · no real patient data or secrets in the repo.

## Milestone Status
- [x] Milestone 1 — Project definition
- [x] Week 3 — Workflow, state model, data dictionary, architecture
- [x] Week 4 — Semantic, accessible HTML form
- [x] Week 5 — External CSS and responsive layout
- [x] Week 6 — JavaScript: urgency selection previews the BR-7 review window
- [x] Week 7 — Validation and business rules in the browser:
  - Referral date cannot be in the future (BR-9)
  - Receiving department preview for the selected service (BR-2)
  - Duplicate active referral blocked using patient ID + service together (BR-3)
  - Submit handler with error and success messages
- [x] Milestone 2 polish: whitespace-only and over-length reason blocked, earliest date limit, demo referral ID, form reset, and repeat submissions blocked
- [x] Week 8 — Local backend in `backend/`: validation (BR-1, BR-9), duplicate blocking (BR-3), routing (BR-2, BR-7), and 21 passing tests
- [x] Milestone 2 — Client-side system: form, responsive CSS, JavaScript behavior, validation, business rules, and boundary tests

## Not Implemented Yet
Connecting the form to the backend (API calls), a web server, AWS, database persistence, and login. The backend enforces BR-1, BR-2, BR-3, BR-7 and BR-9 locally. State changes and roles (BR-4 to BR-6 and BR-8) come in later weeks.
