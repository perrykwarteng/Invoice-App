import express from "express";
import { getDashboardStats } from "../controllers/dashboardStats.controller.js";
import { authRequest } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /dashboard?filter=monthly
// GET /dashboard?filter=range&startDate=2026-01-01&endDate=2026-01-31
router.get("/dashboard",authRequest, getDashboardStats);

export default router;
