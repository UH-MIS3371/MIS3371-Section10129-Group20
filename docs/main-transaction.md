# Main Transaction

## Transaction Event
**Referring provider submits a patient referral**

| Element | Description |
|---|---|
| **Trigger** | A provider decides a patient needs a service outside their own scope of practice. |
| **Inputs** | Patient identifier (fictional), reason for referral, requested service, urgency (Routine or Urgent), referring provider. |
| **System Action** | Check required fields; check for a duplicate active referral; assign a referral ID and status; route to the department that offers the service. |
| **Outcome** | Receiving department accepts it for scheduling, requests more information, or rejects it with a reason. |
| **Official Record** | Referral ID, patient, referring provider, requested service, urgency, receiving department, status, status history with timestamps and the user who made each change, decision reasons. |

## Transaction Flow
1. The referring provider fills in the referral form and submits it.
2. The system checks required fields (BR-1).
   - If anything is missing, the referral is saved as **Incomplete** and the missing fields are shown to the provider, who corrects and resubmits it.
3. The system checks for an active referral for the same patient and service (BR-3). If one exists, the submission is blocked and the existing referral ID is shown.
4. The system assigns a unique referral ID, sets status **Submitted**, and records a timestamp.
5. The system routes the referral to the department that offers the requested service (BR-2) and sets status **Under Review**.
6. Receiving department staff review it and either:
   - **Accept** it → status **Accepted**,
   - **Reject** it with a required reason → status **Rejected** (BR-5), or
   - **Request more information** → status **Incomplete**, returned to the provider (BR-4).
7. Scheduling staff mark an accepted referral **Scheduled**, then **Completed** after the visit (BR-6).
8. Every status change is recorded with a timestamp and user, and the current status is visible to the referring provider and coordinator.

## Actors
- Referring Provider — initiates and corrects
- System — validates, checks duplicates, assigns ID, routes, records history
- Receiving Department Staff — reviews and decides
- Scheduling Staff — marks Scheduled / Completed
- Referral Coordinator — monitors, follows up on overdue referrals, may cancel

## Focus
One transaction is not the whole care episode. We build and track the **referral request** — from submission to a final status — not the appointment, the visit, or billing.
