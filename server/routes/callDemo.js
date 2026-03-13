import { Router } from "express";
import { env } from "../config/env.js";
import { getDefaultDemo } from "../config/demos.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { createRetellPhoneCall } from "../services/retellClient.js";
import { buildDynamicVariables } from "../utils/buildDynamicVariables.js";

const router = Router();

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
    const { firstName, lastName, phone, amount } = req.body || {};
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

    const retellResponse = await createRetellPhoneCall({
      toNumber: payload.phone,
      dynamicVariables,
      agentId: env.retellAgentId,
    });

    return res.json({
      success: true,
      demoKey: demo.demoKey,
      callId: retellResponse.call_id || null,
      response: retellResponse,
    });
  } catch (error) {
    const statusCode = error.statusCode || 502;

    return res.status(statusCode).json({
      error: error.message || "Failed to start call",
      details: error.details || null,
    });
  }
});

export default router;
