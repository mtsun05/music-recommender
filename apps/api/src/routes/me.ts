import { Router } from "express";
import { getCurrentUser } from "../auth/getCurrentUser.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const meRouter = Router();

meRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req);
    res.json(user);
  })
);
