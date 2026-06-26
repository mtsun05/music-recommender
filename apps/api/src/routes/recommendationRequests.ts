import { Router } from "express";
import { getCurrentUser } from "../auth/getCurrentUser.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { listRecommendationRequestsForUser } from "../repositories/recommendationRequestsRepo.js";
import {
  createRecommendationRequestForUser,
  getRecommendationRequestStatus
} from "../services/recommendationRequestService.js";

export const recommendationRequestsRouter = Router();

recommendationRequestsRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req);
    const requests = await listRecommendationRequestsForUser(user.id);
    res.json({ requests });
  })
);

recommendationRequestsRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req);
    const response = await createRecommendationRequestForUser(user.id, req.body);
    res.status(202).json(response);
  })
);

recommendationRequestsRouter.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req);
    const requestId = req.params.id;
    if (!requestId || Array.isArray(requestId)) {
      return res.status(400).json({ error: "Missing recommendation request ID" });
    }

    const response = await getRecommendationRequestStatus(requestId, user.id);
    res.json(response);
  })
);
