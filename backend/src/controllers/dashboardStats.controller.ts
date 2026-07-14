import { Request, Response } from "express";
import { getDashboardStatsService } from "../services/statService.js";
import { AuthUser } from "../types/auth.js";

export async function getDashboardStats(req: Request, res: Response) {
  try {
    const authUser = req.user as AuthUser;
    const organisationId = authUser?.organisationId;

    if (!organisationId) {
      return res.status(401).json({
        message: "Unauthorized: missing organisation",
      });
    }

    const filter = req.query.filter as any;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const data = await getDashboardStatsService({
      organisationId,
      filter,
      startDate,
      endDate,
    });

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
}
