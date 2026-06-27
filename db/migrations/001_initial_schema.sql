create extension if not exists "uuid-ossp";
create extension if not exists vector;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  clerk_user_id text unique not null,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists spotify_accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  spotify_user_id text,
  display_name text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  scopes text[],
  connected_at timestamptz,
  disconnected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists spotify_oauth_states (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  state text unique not null,
  code_verifier text,
  redirect_after text,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists artists (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  sort_name text,
  country text,
  disambiguation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists albums (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  primary_artist_id uuid references artists(id) on delete set null,
  release_date date,
  release_year int,
  album_type text,
  label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tracks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  album_id uuid references albums(id) on delete set null,
  primary_artist_id uuid references artists(id) on delete set null,
  duration_ms int,
  track_number int,
  disc_number int,
  explicit boolean,
  release_date date,
  release_year int,
  isrc text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists external_ids (
  id uuid primary key default uuid_generate_v4(),
  item_type text not null,
  item_id uuid not null,
  source text not null,
  external_id text not null,
  external_url text,
  created_at timestamptz not null default now(),
  constraint external_ids_unique_source unique (source, external_id, item_type)
);

create table if not exists item_mappings (
  id uuid primary key default uuid_generate_v4(),
  source text not null,
  source_item_type text not null,
  source_item_id text not null,
  canonical_item_type text not null,
  canonical_item_id uuid not null,
  match_method text,
  confidence_score float,
  status text not null default 'matched',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists recommendation_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  request_type text not null,
  input_text text,
  input_url text,
  query_item_type text,
  query_item_id uuid,
  requested_limit int not null default 10,
  filters jsonb,
  status text not null default 'queued',
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists recommendation_results (
  id uuid primary key default uuid_generate_v4(),
  recommendation_request_id uuid not null references recommendation_requests(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  algorithm_version text,
  embedding_version text,
  ranking_version text,
  created_at timestamptz not null default now()
);

create table if not exists recommendation_result_items (
  id uuid primary key default uuid_generate_v4(),
  recommendation_result_id uuid not null references recommendation_results(id) on delete cascade,
  rank int not null,
  canonical_item_type text not null,
  canonical_item_id uuid not null,
  vector_score float,
  ranking_score float,
  explanation jsonb,
  created_at timestamptz not null default now()
);

create table if not exists embedding_models (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  provider text,
  dimension int not null,
  version text not null,
  created_at timestamptz not null default now()
);

create table if not exists vector_index_records (
  id uuid primary key default uuid_generate_v4(),
  canonical_item_type text not null,
  canonical_item_id uuid not null,
  vector_collection text not null,
  vector_id text,
  embedding_model_id uuid references embedding_models(id) on delete set null,
  source_text_hash text,
  status text not null default 'pending',
  indexed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists jobs (
  id uuid primary key default uuid_generate_v4(),
  job_type text not null,
  status text not null default 'queued',
  user_id uuid references users(id) on delete set null,
  entity_type text,
  entity_id uuid,
  payload jsonb,
  attempts int not null default 0,
  max_attempts int not null default 3,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Future vector-search tables. These are intentionally simple examples for the scaffold;
-- real indexing will add model/version-specific policies and approximate indexes later.
create table if not exists track_vectors (
  id uuid primary key default uuid_generate_v4(),
  track_id uuid not null references tracks(id) on delete cascade,
  embedding vector(1536),
  embedding_model_id uuid references embedding_models(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists album_vectors (
  id uuid primary key default uuid_generate_v4(),
  album_id uuid not null references albums(id) on delete cascade,
  embedding vector(1536),
  embedding_model_id uuid references embedding_models(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists artist_vectors (
  id uuid primary key default uuid_generate_v4(),
  artist_id uuid not null references artists(id) on delete cascade,
  embedding vector(1536),
  embedding_model_id uuid references embedding_models(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists spotify_accounts_user_id_idx on spotify_accounts(user_id);
create unique index if not exists spotify_accounts_user_spotify_user_idx
  on spotify_accounts(user_id, spotify_user_id)
  where spotify_user_id is not null;
create index if not exists spotify_oauth_states_state_idx on spotify_oauth_states(state);
create index if not exists spotify_oauth_states_expires_at_idx on spotify_oauth_states(expires_at);
create index if not exists albums_primary_artist_id_idx on albums(primary_artist_id);
create index if not exists tracks_album_id_idx on tracks(album_id);
create index if not exists tracks_primary_artist_id_idx on tracks(primary_artist_id);
create index if not exists external_ids_item_idx on external_ids(item_type, item_id);
create index if not exists item_mappings_source_idx on item_mappings(source, source_item_type, source_item_id);
create index if not exists recommendation_requests_user_created_idx on recommendation_requests(user_id, created_at desc);
create index if not exists recommendation_requests_status_idx on recommendation_requests(status);
create index if not exists recommendation_results_request_idx on recommendation_results(recommendation_request_id);
create index if not exists recommendation_result_items_result_rank_idx on recommendation_result_items(recommendation_result_id, rank);
create index if not exists vector_index_records_item_idx on vector_index_records(canonical_item_type, canonical_item_id);
create index if not exists vector_index_records_status_idx on vector_index_records(status);
create index if not exists jobs_status_idx on jobs(status);
create index if not exists jobs_entity_idx on jobs(entity_type, entity_id);

drop trigger if exists users_set_updated_at on users;
create trigger users_set_updated_at before update on users for each row execute function set_updated_at();

drop trigger if exists spotify_accounts_set_updated_at on spotify_accounts;
create trigger spotify_accounts_set_updated_at before update on spotify_accounts for each row execute function set_updated_at();

drop trigger if exists artists_set_updated_at on artists;
create trigger artists_set_updated_at before update on artists for each row execute function set_updated_at();

drop trigger if exists albums_set_updated_at on albums;
create trigger albums_set_updated_at before update on albums for each row execute function set_updated_at();

drop trigger if exists tracks_set_updated_at on tracks;
create trigger tracks_set_updated_at before update on tracks for each row execute function set_updated_at();

drop trigger if exists item_mappings_set_updated_at on item_mappings;
create trigger item_mappings_set_updated_at before update on item_mappings for each row execute function set_updated_at();

drop trigger if exists recommendation_requests_set_updated_at on recommendation_requests;
create trigger recommendation_requests_set_updated_at before update on recommendation_requests for each row execute function set_updated_at();

drop trigger if exists vector_index_records_set_updated_at on vector_index_records;
create trigger vector_index_records_set_updated_at before update on vector_index_records for each row execute function set_updated_at();

drop trigger if exists jobs_set_updated_at on jobs;
create trigger jobs_set_updated_at before update on jobs for each row execute function set_updated_at();
