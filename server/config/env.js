import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envFilePath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: envFilePath });

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 8787),
  sessionSecret: process.env.SESSION_SECRET || "change_this",
  appLoginUser: process.env.APP_LOGIN_USER || "",
  appLoginPassword: process.env.APP_LOGIN_PASSWORD || "",
  retellApiKey: process.env.RETELL_API_KEY || "",
  retellFromNumber: process.env.RETELL_FROM_NUMBER || "",
  retellAgentId: process.env.RETELL_AGENT_ID || "",
  defaultCompanyName: process.env.DEFAULT_COMPANY_NAME || "Collection Expertise",
  defaultDueDate: process.env.DEFAULT_DUE_DATE || "2026-03-20",
};

export const isProduction = env.nodeEnv === "production";
