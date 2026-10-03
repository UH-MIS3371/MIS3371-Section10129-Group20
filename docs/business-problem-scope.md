# Business Problem and Scope

## Business Problem
When a provider at a clinic decides a patient needs care from another department or specialist, the referral is sent by phone, fax, paper form, or email. Referral coordinators re-key the information, chase missing details, and decide by hand which department should receive it. Nothing ties these steps together:

- Referrals are **lost or delayed** because no single record follows a referral from submission to scheduling.
- Referrals arrive **incomplete** (missing reason, requested service, or urgency), which triggers back-and-forth calls before anyone can act.
- The same patient can be referred **twice for the same service** because no one can see that an active referral already exists.
- **Urgent referrals are not prioritized** — they wait in the same inbox as routine ones.
- Referring providers and patients **cannot see status** — whether a referral was received, is under review, or was declined.
- There is **no reliable history** of who accepted or declined a referral, when, or why.

## Problem Statement
There is no single place where a referring provider can submit a patient referral, have it checked for completeness and duplicates, send it to the correct receiving department, and let everyone involved see where it stands until the patient is scheduled or the referral is closed.

## Why It Matters
- Slower access to specialty care, which matters most for urgent referrals
- Duplicate work for coordinators and receiving departments
- Inconsistent handling of incomplete or declined referrals
- Poor visibility for providers and patients
- No audit trail for referral decisions

## In Scope
Our one transaction is **Submit a Patient Referral** and the tracking of that one referral:

- Submit one referral for a patient to a specific service (patient identifier, reason, requested service, urgency, referring provider).
- Validate required fields and block a duplicate active referral for the same patient and service.
- Assign a unique referral ID and route the referral to the department that offers the requested service.
- Let the receiving department accept, reject with a reason, or request more information.
- Track status (Submitted, Incomplete, Under Review, Accepted, Rejected, Scheduled, Completed, Cancelled) with a timestamped history of every change.
- Show current status to the referring provider and coordinator, and let authorized staff search referrals by patient.
- Flag referrals left in review past their time limit for coordinator follow-up.

## Out of Scope
- Integration with Electronic Health Record (EHR) systems
- Insurance verification, prior authorization, billing, or claims
- Real appointment booking or calendar integration (staff only mark a referral "Scheduled")
- Patient-facing portal (patients do not log in; they get status from their provider or coordinator)
- Telehealth, messaging, or email/SMS notifications
- Analytics dashboards and reporting
- Native mobile apps (web application only)
- Any real patient data — the project uses fictional patients and providers only

**Strong scope:** one transaction the team can finish, test, explain, and demonstrate.
