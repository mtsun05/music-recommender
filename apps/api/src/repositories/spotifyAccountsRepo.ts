import { query } from "../db/client.js";

export type SpotifyAccount = {
  id: string;
  userId: string;
  spotifyUserId: string | null;
  displayName: string | null;
  accessTokenEncrypted: string | null;
  refreshTokenEncrypted: string | null;
  tokenExpiresAt: string | null;
  scopes: string[];
  connectedAt: string | null;
  disconnectedAt: string | null;
};

type SpotifyAccountRow = {
  id: string;
  user_id: string;
  spotify_user_id: string | null;
  display_name: string | null;
  access_token_encrypted: string | null;
  refresh_token_encrypted: string | null;
  token_expires_at: string | null;
  scopes: string[] | null;
  connected_at: string | null;
  disconnected_at: string | null;
};

function toSpotifyAccount(row: SpotifyAccountRow): SpotifyAccount {
  return {
    id: row.id,
    userId: row.user_id,
    spotifyUserId: row.spotify_user_id,
    displayName: row.display_name,
    accessTokenEncrypted: row.access_token_encrypted,
    refreshTokenEncrypted: row.refresh_token_encrypted,
    tokenExpiresAt: row.token_expires_at,
    scopes: row.scopes ?? [],
    connectedAt: row.connected_at,
    disconnectedAt: row.disconnected_at
  };
}

export async function getActiveSpotifyAccount(userId: string) {
  const result = await query<SpotifyAccountRow>(
    `
      select
        id,
        user_id,
        spotify_user_id,
        display_name,
        access_token_encrypted,
        refresh_token_encrypted,
        token_expires_at,
        scopes,
        connected_at,
        disconnected_at
      from spotify_accounts
      where user_id = $1 and disconnected_at is null
      order by connected_at desc nulls last, created_at desc
      limit 1
    `,
    [userId]
  );

  const row = result.rows[0];
  return row ? toSpotifyAccount(row) : null;
}

export async function upsertSpotifyAccount(input: {
  userId: string;
  spotifyUserId: string;
  displayName: string | null;
  accessTokenEncrypted: string;
  refreshTokenEncrypted: string | null;
  tokenExpiresAt: Date;
  scopes: string[];
}) {
  const result = await query<SpotifyAccountRow>(
    `
      insert into spotify_accounts (
        user_id,
        spotify_user_id,
        display_name,
        access_token_encrypted,
        refresh_token_encrypted,
        token_expires_at,
        scopes,
        connected_at,
        disconnected_at
      )
      values ($1, $2, $3, $4, $5, $6, $7, now(), null)
      on conflict (user_id, spotify_user_id) where spotify_user_id is not null
      do update set
        display_name = excluded.display_name,
        access_token_encrypted = excluded.access_token_encrypted,
        refresh_token_encrypted = coalesce(excluded.refresh_token_encrypted, spotify_accounts.refresh_token_encrypted),
        token_expires_at = excluded.token_expires_at,
        scopes = excluded.scopes,
        connected_at = now(),
        disconnected_at = null,
        updated_at = now()
      returning
        id,
        user_id,
        spotify_user_id,
        display_name,
        access_token_encrypted,
        refresh_token_encrypted,
        token_expires_at,
        scopes,
        connected_at,
        disconnected_at
    `,
    [
      input.userId,
      input.spotifyUserId,
      input.displayName,
      input.accessTokenEncrypted,
      input.refreshTokenEncrypted,
      input.tokenExpiresAt,
      input.scopes
    ]
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error("Failed to upsert Spotify account");
  }

  return toSpotifyAccount(row);
}

export async function disconnectSpotifyAccounts(userId: string, options = { clearTokens: true }) {
  await query(
    `
      update spotify_accounts
      set disconnected_at = now(),
          access_token_encrypted = case when $2 then null else access_token_encrypted end,
          refresh_token_encrypted = case when $2 then null else refresh_token_encrypted end,
          updated_at = now()
      where user_id = $1 and disconnected_at is null
    `,
    [userId, options.clearTokens]
  );
}
