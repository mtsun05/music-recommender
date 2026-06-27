import { query } from "../db/client.js";

export type SpotifyOAuthStateRow = {
  id: string;
  user_id: string;
  state: string;
  code_verifier: string | null;
  redirect_after: string | null;
  expires_at: string;
  consumed_at: string | null;
  created_at: string;
};

export async function createSpotifyOAuthState(input: {
  userId: string;
  state: string;
  codeVerifier: string;
  redirectAfter: string | null;
  expiresAt: Date;
}) {
  const result = await query<SpotifyOAuthStateRow>(
    `
      insert into spotify_oauth_states (
        user_id,
        state,
        code_verifier,
        redirect_after,
        expires_at
      )
      values ($1, $2, $3, $4, $5)
      returning id, user_id, state, code_verifier, redirect_after, expires_at, consumed_at, created_at
    `,
    [input.userId, input.state, input.codeVerifier, input.redirectAfter, input.expiresAt]
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error("Failed to create Spotify OAuth state");
  }

  return row;
}

export async function consumeSpotifyOAuthState(state: string) {
  const result = await query<SpotifyOAuthStateRow>(
    `
      update spotify_oauth_states
      set consumed_at = now()
      where state = $1
        and consumed_at is null
        and expires_at > now()
      returning id, user_id, state, code_verifier, redirect_after, expires_at, consumed_at, created_at
    `,
    [state]
  );

  return result.rows[0] ?? null;
}
