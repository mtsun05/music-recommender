import { RecommendationRequestStatus } from "@music-recommender/shared";
import { query } from "../db/client.js";

export type RecommendationRequestRow = {
  id: string;
  status: string;
  error_message: string | null;
};

export async function createRecommendationRequest(input: {
  userId: string;
  requestType: string;
  inputText: string | null;
  inputUrl: string | null;
  requestedLimit: number;
  filters: Record<string, unknown>;
}) {
  const result = await query<RecommendationRequestRow>(
    `
      insert into recommendation_requests (
        user_id,
        request_type,
        input_text,
        input_url,
        requested_limit,
        filters,
        status
      )
      values ($1, $2, $3, $4, $5, $6, $7)
      returning id, status, error_message
    `,
    [
      input.userId,
      input.requestType,
      input.inputText,
      input.inputUrl,
      input.requestedLimit,
      JSON.stringify(input.filters),
      RecommendationRequestStatus.Queued
    ]
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error("Failed to create recommendation request");
  }

  return row;
}

export async function listRecommendationRequestsForUser(userId: string) {
  const result = await query<{
    id: string;
    status: string;
    input_text: string | null;
    input_url: string | null;
    requested_limit: number;
    created_at: string;
  }>(
    `
      select id, status, input_text, input_url, requested_limit, created_at
      from recommendation_requests
      where user_id = $1
      order by created_at desc
      limit 25
    `,
    [userId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    status: row.status,
    input: row.input_url ?? row.input_text ?? "",
    requestedLimit: row.requested_limit,
    createdAt: row.created_at
  }));
}

export async function getRecommendationRequestForUser(requestId: string, userId: string) {
  const result = await query<RecommendationRequestRow>(
    `
      select id, status, error_message
      from recommendation_requests
      where id = $1 and user_id = $2
      limit 1
    `,
    [requestId, userId]
  );

  return result.rows[0] ?? null;
}

export async function getRecommendationResultItems(requestId: string) {
  const result = await query<{
    rank: number;
    item_type: "track" | "album" | "artist";
    item_id: string;
    title: string;
    artist: string | null;
    explanation: Record<string, unknown> | null;
  }>(
    `
      select
        rri.rank,
        rri.canonical_item_type as item_type,
        rri.canonical_item_id as item_id,
        coalesce(t.title, a.title, ar.name, 'Placeholder Item') as title,
        coalesce(track_artist.name, album_artist.name, ar.name) as artist,
        rri.explanation
      from recommendation_results rr
      join recommendation_result_items rri on rri.recommendation_result_id = rr.id
      left join tracks t
        on rri.canonical_item_type = 'track' and rri.canonical_item_id = t.id
      left join albums a
        on rri.canonical_item_type = 'album' and rri.canonical_item_id = a.id
      left join artists ar
        on rri.canonical_item_type = 'artist' and rri.canonical_item_id = ar.id
      left join artists track_artist on t.primary_artist_id = track_artist.id
      left join artists album_artist on a.primary_artist_id = album_artist.id
      where rr.recommendation_request_id = $1
      order by rr.created_at desc, rri.rank asc
    `,
    [requestId]
  );

  return result.rows.map((row) => ({
    rank: row.rank,
    itemType: row.item_type,
    itemId: row.item_id,
    title: row.title,
    artist: row.artist,
    explanation: row.explanation
  }));
}
