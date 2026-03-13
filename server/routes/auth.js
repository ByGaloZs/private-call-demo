import { Router } from "express";
import { env } from "../config/env.js";

const router = Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  if (username !== env.appLoginUser || password !== env.appLoginPassword) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  req.session.isAuthenticated = true;
  req.session.user = {
    username,
    allowedDemos: ["collections"],
  };

  return res.json({
    success: true,
    user: req.session.user,
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }

    res.clearCookie("connect.sid");
    return res.json({ success: true });
  });
});

router.get("/me", (req, res) => {
  if (!req.session?.isAuthenticated) {
    return res.json({ authenticated: false });
  }

  return res.json({
    authenticated: true,
    user: req.session.user || null,
  });
});

export default router;
