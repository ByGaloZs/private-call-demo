import { Router } from "express";
import { env } from "../config/env.js";
import { getDefaultDemo } from "../config/demos.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { createRetellPhoneCall } from "../services/retellClient.js";
import { buildDynamicVariables } from "../utils/buildDynamicVariables.js";

const router = Router();

function maskSensitiveValue(value, { visibleStart = 2, visibleEnd = 2 } = {}) {
  const raw = String(value || "");
  if (!raw) {
    return "<empty>";
  }
  if (raw.length <= visibleStart + visibleEnd) {
    return "*".repeat(raw.length);
  }

  return `${raw.slice(0, visibleStart)}${"*".repeat(raw.length - visibleStart - visibleEnd)}${raw.slice(-visibleEnd)}`;
}

function normalizePhoneNumber(value) {
  const digits = String(value || "")
    .replace(/\s+/g, "")
    .replace(/\D/g, "");
  const nationalNumber = (digits.startsWith("52") ? digits.slice(2) : digits).slice(0, 10);

  return `+52${nationalNumber}`;
}

function validateRequiredFields(payload) {
  const requiredFields = ["firstName", "lastName", "phone", "amount"];
  const missing = requiredFields.filter((field) => !String(payload[field] || "").trim());

  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(", ")}`;
  }

  if (Number(payload.amount) <= 0) {
    return "Amount must be greater than 0";
  }

  if (!/^\+52\d{10}$/.test(payload.phone)) {
    return "Phone must use format +52xxxxxxxxxx";
  }

  return null;
}

router.post("/call-demo", requireAuth, async (req, res) => {
  try {
    console.log("=== CALL DEMO START ===");
    console.log("Request body:", req.body);

    const { firstName, lastName, phone, amount } = req.body || {};
    console.log("Phone received from frontend:", phone);

    const payload = {
      firstName: String(firstName || "").trim(),
      lastName: String(lastName || "").trim(),
      phone: normalizePhoneNumber(phone),
      amount: String(amount || "").trim(),
    };

    const validationError = validateRequiredFields(payload);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const demo = getDefaultDemo();
    const dynamicVariables = buildDynamicVariables({
      demo,
      formData: payload,
      envConfig: env,
    });

    console.log("Dynamic variables before Retell:", dynamicVariables);
    console.log("Retell config used:", {
      override_agent_id: maskSensitiveValue(env.retellAgentId, { visibleStart: 4, visibleEnd: 3 }),
      from_number: maskSensitiveValue(env.retellFromNumber, { visibleStart: 3, visibleEnd: 2 }),
    });

    const retellResponse = await createRetellPhoneCall({
      toNumber: payload.phone,
      dynamicVariables,
      agentId: env.retellAgentId,
    });

    console.log("Retell service result:", retellResponse);

    return res.json({
      success: true,
      demoKey: demo.demoKey,
      callId: retellResponse.call_id || null,
      response: retellResponse,
    });
  } catch (error) {
    const statusCode = error.statusCode || 502;

    console.error("CALL DEMO ERROR:", error);

    return res.status(statusCode).json({
      error: error.message || "Failed to start call",
      details: error.details || null,
    });
  }
});

export default router;
