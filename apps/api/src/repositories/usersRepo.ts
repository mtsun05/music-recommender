import { query } from "../db/client.js";

export type AppUser = {
  id: string;
  clerkUserId: string;
  email: string | null;
  displayName: string | null;
};

type UserRow = {
  id: string;
  clerk_user_id: string;
  email: string | null;
  display_name: string | null;
};

function toAppUser(row: UserRow): AppUser {
  return {
    id: row.id,
    clerkUserId: row.clerk_user_id,
    email: row.email,
    displayName: row.display_name
  };
}

export async function upsertUserByClerkId(input: {
  clerkUserId: string;
  email: string | null;
  displayName: string | null;
}) {
  const result = await query<UserRow>(
    `
      insert into users (clerk_user_id, email, display_name)
      values ($1, $2, $3)
      on conflict (clerk_user_id)
      do update set email = excluded.email, display_name = excluded.display_name
      returning id, clerk_user_id, email, display_name
    `,
    [input.clerkUserId, input.email, input.displayName]
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error("Failed to upsert user");
  }

  return toAppUser(row);
}

export async function getActiveSpotifyAccount(userId: string) {
  const result = await query<{ id: string }>(
    `
      select id
      from spotify_accounts
      where user_id = $1 and disconnected_at is null
      order by connected_at desc nulls last, created_at desc
      limit 1
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function disconnectSpotifyAccounts(userId: string) {
  await query(
    `
      update spotify_accounts
      set disconnected_at = now()
      where user_id = $1 and disconnected_at is null
    `,
    [userId]
  );
}
