# Business Rules and System States

Each rule changes whether the transaction is allowed, where it goes, or what happens next.

## Business Rules

| ID | Rule | Type | Enforced Where |
|---|---|---|---|
| **BR-1** | A referral cannot be submitted without patient identifier, referring provider, referral date, reason for referral, requested service, and urgency. | Validation | Browser (`required`) for early feedback; application authoritative |
| **BR-2** | A referral is routed only to the receiving department that offers the requested service. | Routing rule | Browser previews the department; application routes |
| **BR-3** | A patient cannot have two active referrals (not Rejected, Completed, or Cancelled) for the same service. | Conditional business rule (patient + service together) | Browser checks sample data (Week 7); application checks the database |
| **BR-4** | A referral that is missing information, or for which the department requests more information, becomes Incomplete and cannot be routed until the provider corrects and resubmits it. | State / workflow rule | Application |
| **BR-5** | A referral cannot be rejected without a documented reason, and the reason is visible to the referring provider. | Conditional requirement | Application |
| **BR-6** | A referral cannot be marked Scheduled unless it is Accepted, and cannot be marked Completed unless it is Scheduled. | State-control rule | Application |
| **BR-7** | An Urgent referral left Under Review for more than 1 business day, or a Routine referral for more than 3 business days, is flagged as overdue for the referral coordinator. | Timing / escalation rule | Browser shows the review window; application sets `overdueFlag` |
| **BR-8** | Status changes are limited by role: referring providers submit, resubmit, and cancel their own referrals; receiving department staff accept, reject, or request information; scheduling staff mark Scheduled and Completed; referral coordinators may cancel any referral. A cancellation requires a reason and is not allowed after Completed. | Authorization rule | Application |
| **BR-9** | The referral date cannot be in the future. | Validation | Browser (`max` = today + JavaScript); application authoritative |

### Validation vs. Business Rule

- **Validation** asks: is the value usable? Example: `referralDate = 2030-01-01` is invalid because it is in the future.
- **Business rule** asks: what should happen because of the value? Example: `PAT-88213` + Cardiology is a valid entry, but it is blocked because an active Cardiology referral already exists (BR-3).

Browser checks only help the user. The application tier must enforce every rule again, because browser code can be bypassed.

## System States

| State | Meaning | Set By |
|---|---|---|
| **Submitted** | Referral passed validation and received a referral ID. | System |
| **Incomplete** | Missing information or more information requested; returned to the provider. | System / Receiving Dept |
| **Under Review** | Routed to the receiving department and awaiting a decision. | System |
| **Accepted** | Receiving department approved the referral for scheduling. | Receiving Dept |
| **Rejected** | Receiving department declined the referral; reason recorded. (Final) | Receiving Dept |
| **Scheduled** | Patient has an appointment for the service. | Scheduling Staff |
| **Completed** | Patient received the service; referral closed. (Final) | Scheduling Staff |
| **Cancelled** | Withdrawn before completion; reason recorded. (Final) | Provider / Coordinator |

## State Transitions

| From | To | When |
|---|---|---|
| (new) | Submitted | Valid submission (BR-1, BR-3) |
| (new) | Incomplete | Required field missing (BR-1) |
| Incomplete | Submitted | Provider corrects and resubmits |
| Submitted | Under Review | System routes to department (BR-2) |
| Under Review | Accepted | Department accepts |
| Under Review | Rejected | Department rejects with reason (BR-5) |
| Under Review | Incomplete | Department requests more information (BR-4) |
| Accepted | Scheduled | Scheduling staff books the patient (BR-6) |
| Scheduled | Completed | Patient receives the service (BR-6) |
| Any non-final state | Cancelled | Provider or coordinator cancels with reason (BR-8) |
