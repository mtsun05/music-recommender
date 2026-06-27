import { z } from "zod";
import { env } from "../env.js";
import { assertSpotifyAuthConfig } from "./auth.js";

const tokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  scope: z.string().default(""),
  expires_in: z.number(),
  refresh_token: z.string().optional()
});

const profileResponseSchema = z.object({
  id: z.string(),
  display_name: z.string().nullable().optional(),
  external_urls: z
    .object({
      spotify: z.string().optional()
    })
    .optional()
});

export type SpotifyTokenResponse = z.infer<typeof tokenResponseSchema>;
export type SpotifyProfileResponse = z.infer<typeof profileResponseSchema>;

async function parseSpotifyResponse<T>(response: Response, schema: z.ZodType<T>) {
  const body = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    throw Object.assign(new Error("Spotify API request failed"), { statusCode: response.status });
  }

  return schema.parse(body);
}

export async function exchangeSpotifyCodeForToken(input: { code: string; codeVerifier: string }) {
  const config = assertSpotifyAuthConfig();

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: env.SPOTIFY_REDIRECT_URI,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code_verifier: input.codeVerifier
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  return parseSpotifyResponse(response, tokenResponseSchema);
}

export async function getSpotifyCurrentUserProfile(accessToken: string) {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return parseSpotifyResponse(response, profileResponseSchema);
}
