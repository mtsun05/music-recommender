import { Router } from "express";
import { getCurrentUser } from "../auth/getCurrentUser.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { disconnectSpotifyAccounts, getActiveSpotifyAccount } from "../repositories/usersRepo.js";

export const spotifyRouter = Router();

spotifyRouter.get(
  "/status",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req);
    const account = await getActiveSpotifyAccount(user.id);
    res.json({ connected: Boolean(account) });
  })
);

spotifyRouter.post(
  "/disconnect",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req);
    await disconnectSpotifyAccounts(user.id);
    res.json({ connected: false });
  })
);
