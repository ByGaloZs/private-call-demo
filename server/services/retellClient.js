import { env } from "../config/env.js";

const RETELL_CREATE_CALL_URL = "https://api.retellai.com/v2/create-phone-call";

function validateRetellConfig(agentId) {
  if (!env.retellApiKey || !env.retellFromNumber || !agentId) {
    throw new Error("Retell configuration is missing. Check RETELL_API_KEY, RETELL_FROM_NUMBER, and RETELL_AGENT_ID.");
  }
}

export async function createRetellPhoneCall({ toNumber, dynamicVariables, agentId }) {
  validateRetellConfig(agentId);

  const payload = {
    from_number: env.retellFromNumber,
    to_number: toNumber,
    override_agent_id: agentId,
    retell_llm_dynamic_variables: dynamicVariables,
  };

  const response = await fetch(RETELL_CREATE_CALL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.retellApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  const parsedBody = responseText ? JSON.parse(responseText) : {};

  if (!response.ok) {
    const message = parsedBody.message || parsedBody.error || "Retell call request failed";
    const error = new Error(message);
    error.statusCode = response.status;
    error.details = parsedBody;
    throw error;
  }

  return parsedBody;
}
