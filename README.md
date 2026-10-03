# TPS_3371_TEAM_20 — Patient Referral Management System

**Course:** MIS 3371 — Capstone Project
**Milestone:** Milestone 1 — Project Definition

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
│   └── data-dictionary.html
├── diagrams/
│   ├── architecture-v1.html
│   ├── state-model-v1.html
│   └── workflow-v1.html
├── app/
│   ├── index.html       (live transaction form)
│   ├── styles.css
│   └── app.js
└── archive/              (superseded drafts, kept for history)
    ├── transaction-form.html
    └── patient-referral.html
```

## Git Workflow
Pull before starting · one focused branch per task · pull request with one reviewer before merging to `main` · no real patient data or secrets in the repo.

## Milestone Status
- [x] Milestone 1 — Project definition
- [x] Week 6: `app/app.js` added. Selecting an urgency level previews the BR-7 review window before the referral is submitted
- [ ] Milestone 2 — Implementation begins after Milestone 1 approval
