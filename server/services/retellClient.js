import { env } from "../config/env.js";

const RETELL_CREATE_CALL_URL = "https://api.retellai.com/v2/create-phone-call";

function validateRetellConfig(agentId) {
  if (!env.retellApiKey || !env.retellFromNumber || !agentId) {
    throw new Error("Retell configuration is missing. Check RETELL_API_KEY, RETELL_FROM_NUMBER, and RETELL_AGENT_ID.");
  }
}

export async function createRetellPhoneCall({ toNumber, dynamicVariables, agentId }) {
  try {
    validateRetellConfig(agentId);

    const payload = {
      from_number: env.retellFromNumber,
      to_number: toNumber,
      override_agent_id: agentId,
      retell_llm_dynamic_variables: dynamicVariables,
    };

    console.log("=== RETELL REQUEST START ===");
    console.log("Retell request body:", payload);
    console.log("from_number:", payload.from_number);
    console.log("to_number:", payload.to_number);
    console.log("override_agent_id:", payload.override_agent_id);
    console.log("retell_llm_dynamic_variables:", payload.retell_llm_dynamic_variables);

    const response = await fetch(RETELL_CREATE_CALL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.retellApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("Retell HTTP status:", response.status);

    const responseText = await response.text();
    console.log("Retell raw response:", responseText);

    let parsedBody;
    try {
      parsedBody = responseText ? JSON.parse(responseText) : {};
      console.log("Retell parsed response:", parsedBody);
    } catch (parseError) {
      console.error("Retell parsed response: failed to parse JSON, using raw text");
      console.error("Retell raw response:", responseText);
      throw parseError;
    }

    if (!response.ok) {
      console.error("Retell response not ok; throwing error before returning to route handler");
      const message = parsedBody.message || parsedBody.error || "Retell call request failed";
      const error = new Error(message);
      error.statusCode = response.status;
      error.details = parsedBody;
      throw error;
    }

    return parsedBody;
  } catch (error) {
    console.error("RETELL REQUEST ERROR:", error);
    throw error;
  }
}
