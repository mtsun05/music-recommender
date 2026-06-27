import { consumeSpotifyOAuthState } from "../repositories/spotifyOAuthStatesRepo.js";
import { upsertSpotifyAccount } from "../repositories/spotifyAccountsRepo.js";
import { exchangeSpotifyCodeForToken, getSpotifyCurrentUserProfile } from "../spotify/client.js";
import { encryptSpotifyToken } from "../spotify/tokenCrypto.js";

function toScopes(scope: string) {
  return scope
    .split(" ")
    .map((value) => value.trim())
    .filter(Boolean);
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
