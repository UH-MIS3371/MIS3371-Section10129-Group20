// Week 6: previews BR-7's review window based on the selected urgency,
// before the referral is submitted.

const URGENT_VALUE = "urgent";

const urgencySelect = document.querySelector("#urgency");
const routingMessage = document.querySelector("#routingMessage");

function requiresPriorityRouting(urgencyValue) {
  return urgencyValue === URGENT_VALUE;
}

function updateRoutingMessage() {
  const urgencyValue = urgencySelect.value;

  if (urgencyValue === "") {
    routingMessage.textContent = "";
    return;
  }

  if (requiresPriorityRouting(urgencyValue)) {
    routingMessage.textContent =
      "Urgent referrals are flagged for review within 1 business day.";
  } else {
    routingMessage.textContent =
      "Routine referrals are reviewed within 3 business days.";
  }
}

urgencySelect.addEventListener("change", updateRoutingMessage);
