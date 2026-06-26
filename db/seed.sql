insert into artists (id, name, sort_name, country, disambiguation)
values
  ('11111111-1111-4111-8111-111111111111', 'Placeholder Artist 1', 'Placeholder Artist 1', null, 'Seeded scaffold artist'),
  ('22222222-2222-4222-8222-222222222222', 'Placeholder Artist 2', 'Placeholder Artist 2', null, 'Seeded scaffold artist'),
  ('33333333-3333-4333-8333-333333333333', 'Placeholder Artist 3', 'Placeholder Artist 3', null, 'Seeded scaffold artist')
on conflict (id) do nothing;

insert into albums (id, title, primary_artist_id, release_year, album_type, label)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Placeholder Album 1', '11111111-1111-4111-8111-111111111111', 2026, 'album', 'Scaffold Records'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'Placeholder Album 2', '22222222-2222-4222-8222-222222222222', 2026, 'album', 'Scaffold Records'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'Placeholder Album 3', '33333333-3333-4333-8333-333333333333', 2026, 'album', 'Scaffold Records')
on conflict (id) do nothing;

insert into tracks (id, title, album_id, primary_artist_id, duration_ms, track_number, disc_number, explicit, release_year)
values
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'Placeholder Track 1', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '11111111-1111-4111-8111-111111111111', 180000, 1, 1, false, 2026),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'Placeholder Track 2', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '22222222-2222-4222-8222-222222222222', 196000, 1, 1, false, 2026),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3', 'Placeholder Track 3', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '33333333-3333-4333-8333-333333333333', 204000, 1, 1, false, 2026)
on conflict (id) do nothing;
