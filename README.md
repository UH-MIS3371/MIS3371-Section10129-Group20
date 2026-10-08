# TPS_3371_TEAM_20 — Patient Referral Management System

**Course:** MIS 3371 — Capstone Project
**Current release:** through Week 7 (validation and business-rule behavior)

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
MIS3371-Section10129-Group20/
├── README.md
├── Performance_Tracker.xlsx
├── state_transaction_workflow.html   (state diagram, workflow, and worksheet)
├── transaction_workflow.html         (workflow and worksheet only)
├── docs/
│   ├── team-charter.md
│   ├── business-problem-scope.md
│   ├── stakeholders.md
│   ├── main-transaction.md
│   ├── requirements.md
│   ├── user-stories-acceptance.md
│   ├── business-rules-states.md
│   ├── traceability-matrix.md
│   └── data-dictionary.html
├── diagrams/
│   └── architecture-v1.html          (three tiers + responsibility notes)
├── app/
│   ├── index.html                    (referral form)
│   ├── styles.css
│   └── app.js
└── archive/                          (superseded drafts, kept for history)
```

## Week 7 Tests

Open `app/index.html` in a browser and fill every field. Sample active referrals in `app.js`: `PAT-88213` + Cardiology (`REF-2026-004821`) and `PAT-10452` + Orthopedics (`REF-2026-004905`).

| # | Test | Input | Expected Result |
|---|---|---|---|
| 1 | Date boundary: today | Referral date = today | Passes (BR-9 allows today) |
| 2 | Date boundary: tomorrow | Referral date = tomorrow | Blocked: "Referral date cannot be in the future. Choose today or an earlier date." |
| 3 | Duplicate referral | `PAT-88213` + Cardiology | Blocked at submit: shows `REF-2026-004821`; cursor moves to Patient ID (BR-3) |
| 4 | Same patient, different service | `PAT-88213` + Dermatology | Passes: only the same patient + same service is a duplicate |
| 5 | New patient | `PAT-12345` + Cardiology + Urgent | Passes: routed to Cardiology Dept, review within 1 business day (BR-2, BR-7) |
| 6 | Urgency changes the path | Switch Urgent ↔ Routine | Message changes between 1 and 3 business days; the referral is still valid (BR-7) |
| 7 | Department routing | Pick each service | Message names the matching department (BR-2) |

Test 2 is the boundary test: today is the last valid date, so tomorrow is the first blocked value.

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
- [ ] Week 8 — Finish and test the client side; Milestone 2

## Not Implemented Yet
API calls, server-side enforcement of business rules, database persistence, and login. Browser checks only help the user; the application tier will enforce the same rules in later weeks.
