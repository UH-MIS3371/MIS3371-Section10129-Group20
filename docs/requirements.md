# Requirements

## Functional Requirements
Each requirement is written so another person could later test whether it was met.

| ID | Requirement |
|---|---|
| **FR-1** | The system shall allow a referring provider to submit one referral capturing patient identifier, reason for referral, requested service, urgency (Routine/Urgent), and referring provider. |
| **FR-2** | The system shall reject a submission with missing required fields, save it as Incomplete, and list the missing fields. |
| **FR-3** | The system shall assign each accepted submission a unique referral ID and an initial status of Submitted. |
| **FR-4** | The system shall route a validated referral to the receiving department mapped to the requested service and set its status to Under Review. |
| **FR-5** | The system shall allow receiving department staff to accept a referral, reject it with a required reason, or request more information. |
| **FR-6** | The system shall record every status change with a timestamp and the user who made it, and show the current status and history to the referring provider and coordinator. |
| **FR-7** | The system shall allow authorized staff to search referrals by patient identifier and view each referral's current status. |

## Quality / Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| **NFR-1** | Accessibility | The referral and review forms shall be fully usable by keyboard and every input shall have a visible, programmatic label. |
| **NFR-2** | Usability | Required-field feedback shall name each field the provider must correct, next to that field. |
| **NFR-3** | Auditability | Status changes, timestamps, users, and decision reasons shall be preserved and cannot be edited after they are recorded. |
| **NFR-4** | Responsiveness | The interface shall remain usable on common laptop and mobile screen widths (360 px and up). |
| **NFR-5** | Safe demo data | The project shall use only fictional patients, providers, and departments — no real patient health information. |
| **NFR-6** | Access control | Each role shall see only the actions permitted to it in BR-8 (e.g., a referring provider cannot accept a referral). |

Requirements match the approved scope. We do not promise capabilities we will not build (EHR integration, real scheduling, notifications by email/SMS).
