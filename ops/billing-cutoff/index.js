const { google } = require("googleapis");

// Intentionally hardcoded and narrow: this function may only ever disable
// billing for THIS project, never for the billing account as a whole and
// never for any other project — even if the Pub/Sub message claimed
// otherwise. That's what makes it safe to run on a billing account shared
// with unrelated projects.
const PROJECT_ID = "agentic-web-starter";

/**
 * Triggered by a Cloud Billing budget alert (via Pub/Sub). If the current
 * spend has reached or exceeded the budget amount, unlinks this project's
 * billing account — which stops Cloud Run (and any other billable resource)
 * in this project from accepting further traffic, at the cost of the
 * service going offline until billing is manually re-linked.
 */
exports.disableBillingOnBudgetExceeded = async (cloudEvent) => {
  const base64Data = cloudEvent?.data?.message?.data;
  if (!base64Data) {
    console.error("No Pub/Sub message data found on the CloudEvent.");
    return;
  }

  const notification = JSON.parse(Buffer.from(base64Data, "base64").toString("utf-8"));
  console.log("Budget notification received:", JSON.stringify(notification));

  const costAmount = notification.costAmount ?? 0;
  const budgetAmount = notification.budgetAmount ?? 0;

  if (budgetAmount <= 0 || costAmount < budgetAmount) {
    console.log(`Spend ${costAmount} is under budget ${budgetAmount}. No action taken.`);
    return;
  }

  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-billing"],
  });
  const billing = google.cloudbilling({ version: "v1", auth });

  const projectName = `projects/${PROJECT_ID}`;
  const current = await billing.projects.getBillingInfo({ name: projectName });

  if (!current.data.billingEnabled) {
    console.log(`Billing already disabled for ${PROJECT_ID}. No action needed.`);
    return;
  }

  await billing.projects.updateBillingInfo({
    name: projectName,
    requestBody: { billingAccountName: "" },
  });

  console.log(
    `Spend ${costAmount} reached/exceeded budget ${budgetAmount} — billing disabled for ${PROJECT_ID} only.`,
  );
};
