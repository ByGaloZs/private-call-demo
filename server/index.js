import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import session from "express-session";
import { env, isProduction } from "./config/env.js";
import authRoutes from "./routes/auth.js";
import demoConfigRoutes from "./routes/demoConfig.js";
import callDemoRoutes from "./routes/callDemo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../dist");

const app = express();

// Temporary diagnostics to verify env loading and final bind target.
console.log("[startup] process.cwd():", process.cwd());
console.log("[startup] process.env.PORT:", process.env.PORT);
console.log("[startup] env.port (final):", env.port);

app.use(express.json());
app.use(
  session({
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 8,
    },
  }),
);

app.use("/api", authRoutes);
app.use("/api", demoConfigRoutes);
app.use("/api", callDemoRoutes);

app.use("/api/*", (_req, res) => {
  res.status(404).json({ error: "API route not found" });
});

if (isProduction) {
  app.use(express.static(distPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }

    return res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
