import { query } from "../db/client.js";

const placeholderArtists = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Placeholder Artist 1"
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Placeholder Artist 2"
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Placeholder Artist 3"
  }
];

const placeholderAlbums = [
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
    title: "Placeholder Album 1",
    artistId: "11111111-1111-4111-8111-111111111111"
  },
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
    title: "Placeholder Album 2",
    artistId: "22222222-2222-4222-8222-222222222222"
  },
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3",
    title: "Placeholder Album 3",
    artistId: "33333333-3333-4333-8333-333333333333"
  }
];

const placeholderTracks = [
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1",
    title: "Placeholder Track 1",
    albumId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
    artistId: "11111111-1111-4111-8111-111111111111"
  },
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2",
    title: "Placeholder Track 2",
    albumId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
    artistId: "22222222-2222-4222-8222-222222222222"
  },
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3",
    title: "Placeholder Track 3",
    albumId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3",
    artistId: "33333333-3333-4333-8333-333333333333"
  }
];

export async function ensurePlaceholderCatalog() {
  for (const artist of placeholderArtists) {
    await query(
      `
        insert into artists (id, name, sort_name, disambiguation)
        values ($1, $2, $2, $3)
        on conflict (id) do nothing
      `,
      [artist.id, artist.name, "Worker-created scaffold artist"]
    );
  }

  for (const album of placeholderAlbums) {
    await query(
      `
        insert into albums (id, title, primary_artist_id, release_year, album_type, label)
        values ($1, $2, $3, $4, $5, $6)
        on conflict (id) do nothing
      `,
      [album.id, album.title, album.artistId, 2026, "album", "Scaffold Records"]
    );
  }

  for (const track of placeholderTracks) {
    await query(
      `
        insert into tracks (
          id,
          title,
          album_id,
          primary_artist_id,
          duration_ms,
          track_number,
          disc_number,
          explicit,
          release_year
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        on conflict (id) do nothing
      `,
      [track.id, track.title, track.albumId, track.artistId, 180000, 1, 1, false, 2026]
    );
  }
}

export async function getPlaceholderTracks(limit: number) {
  const result = await query<{ id: string }>(
    `
      select id
      from tracks
      where title like 'Placeholder Track%'
      order by title asc
      limit $1
    `,
    [limit]
  );

  return result.rows.map((row, index) => ({
    id: row.id,
    itemType: "track" as const,
    rank: index + 1
  }));
}
