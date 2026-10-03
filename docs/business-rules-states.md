# Business Rules and System States

Each rule changes whether the transaction is allowed, where it goes, or what happens next.

## Business Rules

| ID | Rule |
|---|---|
| **BR-1** | A referral cannot be submitted without patient identifier, reason for referral, requested service, urgency, and referring provider. |
| **BR-2** | A referral is routed only to the receiving department that offers the requested service. |
| **BR-3** | A patient cannot have two active referrals (not Rejected, Completed, or Cancelled) for the same service. |
| **BR-4** | A referral that is missing information, or for which the department requests more information, becomes Incomplete and cannot be routed until the provider corrects and resubmits it. |
| **BR-5** | A referral cannot be rejected without a documented reason, and the reason is visible to the referring provider. |
| **BR-6** | A referral cannot be marked Scheduled unless it is Accepted, and cannot be marked Completed unless it is Scheduled. |
| **BR-7** | An Urgent referral left Under Review for more than 1 business day, or a Routine referral for more than 3 business days, is flagged as overdue for the referral coordinator. |
| **BR-8** | Status changes are limited by role: referring providers submit, resubmit, and cancel their own referrals; receiving department staff accept, reject, or request information; scheduling staff mark Scheduled and Completed; referral coordinators may cancel any referral. A cancellation requires a reason and is not allowed after Completed. |

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
