import type { SpotifyDisconnectResponse, SpotifyStatusResponse } from "@music-recommender/shared";
import { Router } from "express";
import { getCurrentUser } from "../auth/getCurrentUser.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  disconnectSpotifyAccounts,
  getActiveSpotifyAccount
} from "../repositories/spotifyAccountsRepo.js";
import { completeSpotifyAccountLink } from "../services/spotifyService.js";
import { createSpotifyAuthorizationUrl } from "../spotify/auth.js";

export const spotifyRouter = Router();

const frontendOrigin = "http://localhost:5173";

function normalizeRedirectAfter(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  if (value.startsWith("/")) {
    return `${frontendOrigin}${value}`;
  }

  try {
    const parsed = new URL(value);
    return parsed.origin === frontendOrigin ? parsed.toString() : null;
  } catch {
    return null;
  }
}

spotifyRouter.get(
  "/status",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req);
    const account = await getActiveSpotifyAccount(user.id);
    const response: SpotifyStatusResponse = {
      connected: Boolean(account),
      displayName: account?.displayName ?? null,
      scopes: account?.scopes ?? [],
      connectedAt: account?.connectedAt ?? null
    };

    res.json(response);
  })
);

spotifyRouter.get(
  "/connect",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req);
    const redirectAfter = normalizeRedirectAfter(req.query.redirectAfter);
    const authorizationUrl = await createSpotifyAuthorizationUrl({
      userId: user.id,
      redirectAfter
    });

    res.redirect(authorizationUrl);
  })
);

spotifyRouter.get(
  "/callback",
  asyncHandler(async (req, res) => {
    const code = typeof req.query.code === "string" ? req.query.code : null;
    const state = typeof req.query.state === "string" ? req.query.state : null;
    const error = typeof req.query.error === "string" ? req.query.error : null;

    if (error) {
      throw Object.assign(new Error("Spotify authorization was not completed"), {
        statusCode: 400
      });
    }

    if (!code || !state) {
      throw Object.assign(new Error("Missing Spotify authorization parameters"), {
        statusCode: 400
      });
    }

    const { redirectAfter } = await completeSpotifyAccountLink({ code, state });
    res.redirect(normalizeRedirectAfter(redirectAfter) ?? frontendOrigin);
  })
);

spotifyRouter.post(
  "/disconnect",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req);
    await disconnectSpotifyAccounts(user.id);
    const response: SpotifyDisconnectResponse = { connected: false };
    res.json(response);
  })
);
