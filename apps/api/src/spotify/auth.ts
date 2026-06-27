import { createHash, randomBytes } from "node:crypto";
import { env } from "../env.js";
import { createSpotifyOAuthState } from "../repositories/spotifyOAuthStatesRepo.js";

const authorizeUrl = "https://accounts.spotify.com/authorize";
const stateTtlMs = 10 * 60 * 1000;
const defaultScopes = ["user-read-email"];

function base64Url(buffer: Buffer) {
  return buffer.toString("base64url");
}

export function createCodeVerifier() {
  return base64Url(randomBytes(64));
}

export function createCodeChallenge(codeVerifier: string) {
  return base64Url(createHash("sha256").update(codeVerifier).digest());
}

export function assertSpotifyAuthConfig() {
  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET) {
    throw Object.assign(new Error("Spotify OAuth is not configured"), { statusCode: 503 });
  }

  return {
    clientId: env.SPOTIFY_CLIENT_ID,
    clientSecret: env.SPOTIFY_CLIENT_SECRET
  };
}

export async function createSpotifyAuthorizationUrl(input: {
  userId: string;
  redirectAfter: string | null;
}) {
  const config = assertSpotifyAuthConfig();

  const state = base64Url(randomBytes(32));
  const codeVerifier = createCodeVerifier();
  const codeChallenge = createCodeChallenge(codeVerifier);

  await createSpotifyOAuthState({
    userId: input.userId,
    state,
    codeVerifier,
    redirectAfter: input.redirectAfter,
    expiresAt: new Date(Date.now() + stateTtlMs)
  });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: env.SPOTIFY_REDIRECT_URI,
    state,
    scope: defaultScopes.join(" "),
    code_challenge_method: "S256",
    code_challenge: codeChallenge
  });

  return `${authorizeUrl}?${params.toString()}`;
}
