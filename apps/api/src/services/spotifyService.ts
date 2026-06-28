import { consumeSpotifyOAuthState } from "../repositories/spotifyOAuthStatesRepo.js";
import {
  disconnectSpotifyAccount,
  getActiveSpotifyAccount,
  type SpotifyAccount,
  updateSpotifyAccountTokens,
  upsertSpotifyAccount
} from "../repositories/spotifyAccountsRepo.js";
import {
  exchangeSpotifyCodeForToken,
  getSpotifyCurrentUserProfile,
  isSpotifyInvalidGrantError,
  refreshSpotifyAccessToken
} from "../spotify/client.js";
import { decryptSpotifyToken, encryptSpotifyToken } from "../spotify/tokenCrypto.js";

const tokenRefreshSkewMs = 5 * 60 * 1000;

function toScopes(scope: string) {
  return scope
    .split(" ")
    .map((value) => value.trim())
    .filter(Boolean);
}

function reconnectRequiredError() {
  return Object.assign(new Error("Spotify account requires reconnect"), {
    statusCode: 409,
    code: "SPOTIFY_RECONNECT_REQUIRED"
  });
}

function shouldRefreshToken(tokenExpiresAt: string | null) {
  if (!tokenExpiresAt) {
    return true;
  }

  const expiresAtMs = Date.parse(tokenExpiresAt);
  return !Number.isFinite(expiresAtMs) || expiresAtMs - Date.now() <= tokenRefreshSkewMs;
}

async function refreshStoredSpotifyAccessToken(account: SpotifyAccount) {
  if (!account.refreshTokenEncrypted) {
    await disconnectSpotifyAccount(account.id);
    throw reconnectRequiredError();
  }

  try {
    const tokenResponse = await refreshSpotifyAccessToken({
      refreshToken: decryptSpotifyToken(account.refreshTokenEncrypted)
    });

    await updateSpotifyAccountTokens({
      accountId: account.id,
      accessTokenEncrypted: encryptSpotifyToken(tokenResponse.access_token),
      refreshTokenEncrypted: tokenResponse.refresh_token
        ? encryptSpotifyToken(tokenResponse.refresh_token)
        : undefined,
      tokenExpiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000)
    });

    return tokenResponse.access_token;
  } catch (error) {
    if (isSpotifyInvalidGrantError(error)) {
      await disconnectSpotifyAccount(account.id);
      throw reconnectRequiredError();
    }

    throw error;
  }
}

export async function completeSpotifyAccountLink(input: { code: string; state: string }) {
  const oauthState = await consumeSpotifyOAuthState(input.state);

  if (!oauthState?.code_verifier) {
    throw Object.assign(new Error("Invalid or expired Spotify OAuth state"), { statusCode: 400 });
  }

  const tokenResponse = await exchangeSpotifyCodeForToken({
    code: input.code,
    codeVerifier: oauthState.code_verifier
  });
  const profile = await getSpotifyCurrentUserProfile(tokenResponse.access_token);

  const account = await upsertSpotifyAccount({
    userId: oauthState.user_id,
    spotifyUserId: profile.id,
    displayName: profile.display_name ?? null,
    accessTokenEncrypted: encryptSpotifyToken(tokenResponse.access_token),
    refreshTokenEncrypted: tokenResponse.refresh_token
      ? encryptSpotifyToken(tokenResponse.refresh_token)
      : null,
    tokenExpiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
    scopes: toScopes(tokenResponse.scope ?? "")
  });

  return {
    account,
    redirectAfter: oauthState.redirect_after
  };
}

export async function getValidSpotifyAccessTokenForUser(userId: string) {
  const account = await getActiveSpotifyAccount(userId);

  if (!account) {
    throw reconnectRequiredError();
  }

  if (!account.accessTokenEncrypted) {
    await disconnectSpotifyAccount(account.id);
    throw reconnectRequiredError();
  }

  if (shouldRefreshToken(account.tokenExpiresAt)) {
    return refreshStoredSpotifyAccessToken(account);
  }

  return decryptSpotifyToken(account.accessTokenEncrypted);
}
