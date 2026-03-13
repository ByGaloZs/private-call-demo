import { Router } from "express";
import { getDefaultDemo, toPublicDemoConfig } from "../config/demos.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/demo-config", requireAuth, (req, res) => {
  const defaultDemo = getDefaultDemo();
  const allowedDemos = req.session.user?.allowedDemos || [defaultDemo.demoKey];

  if (!allowedDemos.includes(defaultDemo.demoKey)) {
    return res.status(403).json({ error: "No allowed demos for this user" });
  }

  return res.json({
    currentDemoKey: defaultDemo.demoKey,
    allowedDemoKeys: allowedDemos,
    demo: toPublicDemoConfig(defaultDemo),
  });
});

export default router;
