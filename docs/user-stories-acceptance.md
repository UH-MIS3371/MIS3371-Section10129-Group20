# User Stories and Acceptance Criteria

Story = stakeholder value. Criteria = observable evidence.

| # | Role | User Story | Acceptance Criteria |
|---|---|---|---|
| 1 | Referring Provider | As a referring provider, I want to submit a referral online so that I know it was received. | Given valid required data, when I submit, then I receive a referral ID and the status shows "Submitted." |
| 2 | Referring Provider | As a referring provider, I want to be told exactly what is missing so that I can fix the referral quickly. | Given a referral missing the requested service, when I submit, then it is saved as "Incomplete" and the requested-service field is flagged. |
| 3 | Receiving Department Staff | As receiving department staff, I want a queue of referrals routed to my department so that I can review them consistently. | Given a referral routed to Cardiology, when Cardiology staff open the review queue, then the referral and its details appear with Accept, Reject, and Request Info actions. |
| 4 | Receiving Department Staff | As receiving department staff, I want to record a reason when I reject a referral so that the provider understands the decision. | Given a referral Under Review, when I click Reject without a reason, then the system blocks the action; when I enter a reason, then the status is "Rejected" and the reason is visible to the provider. |
| 5 | Referral Coordinator | As a referral coordinator, I want to look up a patient's referral so that I can tell the patient when to expect care. | Given an existing referral, when I search by the patient identifier, then the current status and the date/time of the latest update are shown. |
