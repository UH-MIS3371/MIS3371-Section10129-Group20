# Traceability Matrix

Traceability shows why each requirement exists, which rule controls it, and how we will test it.

| Business Need | Requirement | User Story | Rule(s) | Evidence / Test Direction |
|---|---|---|---|---|
| Complete referrals | FR-1, FR-2 | US-1, US-2 | BR-1, BR-9 | Leave each required field blank; enter a future referral date; both are blocked |
| Correct routing | FR-4 | US-3 | BR-2 | Pick each service; the matching receiving department is shown |
| No duplicate referrals | FR-1 | US-1 | BR-3 | `PAT-88213` + Cardiology is blocked and shows `REF-2026-004821`; `PAT-88213` + Dermatology passes |
| Reliable identity | FR-3 | US-1 | — | Each submitted referral receives a unique `referralId` that never changes (application tier, later weeks) |
| Controlled lifecycle | FR-5 | US-3, US-4 | BR-4, BR-5, BR-6 | Try invalid transitions (e.g., Under Review → Scheduled); the application rejects them (later weeks) |
| Urgent referrals prioritized | FR-8 | US-3 | BR-7 | Urgent shows a 1-business-day window and Routine shows 3; `overdueFlag` is set after the window (later weeks) |
| Visibility and audit trail | FR-6, FR-7, NFR-3 | US-5 | BR-8 | Every status change creates a Status History Log row with who, when, and why |
| Role-based actions | NFR-6 | US-3, US-4 | BR-8 | A referring provider cannot accept a referral (application tier, later weeks) |
| Accessible entry | NFR-1, NFR-2, NFR-4 | US-1 | — | Keyboard-only form completion; every input has a label; usable at 360 px wide |
| Safe demo data | NFR-5 | — | — | Only fictional IDs (`PAT-`, `DR-`, `REF-`) appear anywhere in the repo |

User stories are numbered in the order they appear in `user-stories-acceptance.md` (US-1 through US-5).

## Why This Matters

Every field, rule, and screen should answer:

- Which requirement does this satisfy?
- Which business rule controls it?
- How will we test it?
- Which tier enforces it? (See `diagrams/architecture-v1.html`.)
