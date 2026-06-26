# AGENTS.md

Guidance for Codex and other coding agents working in this repository.

## Project Snapshot

Music Recommender is a Stage 1 scaffold for a music recommendation web app. The current goal is clean structure and extensibility, not a real recommendation engine.

Current capabilities:

- Clerk-authenticated React dashboard.
- Express API with protected user, recommendation-request, and Spotify placeholder routes.
- Supabase/Postgres schema for users, catalog entities, mappings, recommendation requests/results, vector index records, and durable jobs.
- AWS SQS enqueueing from the API.
- TypeScript worker that processes placeholder recommendation jobs.
- Python worker scaffold for future embedding/ranking/vector work.

Intentionally not implemented yet:

- Spotify OAuth or library import.
- MusicBrainz, ListenBrainz, FMA, or other metadata integrations.
- Real embeddings.
- Real vector search.
- Recommendation ranking.
- Taste clusters, feedback, billing, admin tools, or production CI/CD.

## Repo Layout

- `apps/web`: React + Vite + TypeScript frontend using Clerk React.
- `apps/api`: Express + TypeScript API using Clerk Express, Zod, Postgres, and SQS.
- `workers/ts-worker`: TypeScript SQS worker skeleton.
- `workers/py-worker`: Python scaffold for future ML/recommendation work.
- `packages/shared`: Shared TypeScript constants, DTOs, and Zod schemas.
- `db`: Supabase/Postgres schema, migration, and seed data.
- `infra`: Local infrastructure notes and SQS documentation.

## Commands

Use pnpm from the repo root.

```bash
pnpm install
pnpm check
pnpm typecheck
pnpm lint
pnpm format:check
pnpm db:schema
```

Development commands:

```bash
pnpm dev:web
pnpm dev:api
pnpm dev:worker
pnpm dev
```

Local services:

```bash
pnpm local:up
pnpm local:down
```

Use `docker compose down -v` only when intentionally wiping the local Postgres volume.

Preferred local run order when reading logs separately:

```bash
pnpm local:up
pnpm dev:api
pnpm dev:worker
pnpm dev:web
```

## Environment

Copy examples before running services:

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
cp workers/ts-worker/.env.example workers/ts-worker/.env
```

Required local service defaults:

- API runs on `http://localhost:4000`.
- Web runs on Vite, usually `http://localhost:5173`.
- Local Postgres uses `postgres://postgres:postgres@localhost:5432/music_recommender`.
- LocalStack creates the SQS queue `recommendation-jobs`.

Do not commit real secrets.

## Architecture Rules

- Keep route handlers thin.
- Put validation schemas and shared DTOs in `packages/shared`.
- Put API database queries in `apps/api/src/repositories`.
- Put API workflow/business logic in `apps/api/src/services`.
- Keep SQS logic isolated under `sqs` or queue service modules.
- Use Zod for API request validation.
- Use TypeScript strict mode.
- Prefer extending existing repository/service patterns over adding new architectural styles.

## Frontend Rules

- Keep API calls in `apps/web/src/lib/apiClient.ts`.
- Use Clerk hooks/components for auth state.
- Dashboard polling currently uses `GET /recommendation-requests/:id`.
- Preserve the dark, Vercel-like theme with dark green accent unless intentionally redesigning.
- Do not scatter raw `fetch` calls through components.

## API Routes

Current API routes:

- `GET /health`: public health check.
- `GET /me`: protected; upserts the Clerk user into `users`.
- `POST /recommendation-requests`: protected; validates input, creates DB rows, enqueues SQS job. If enqueue fails after DB rows are created, marks the created request/job failed and returns HTTP 503 with `{ error, code: "QUEUE_UNAVAILABLE", retryable: true }`.
- `GET /recommendation-requests`: protected; returns recent requests.
- `GET /recommendation-requests/:id`: protected; returns status and completed placeholder results.
- `GET /spotify/status`: protected; reports scaffolded Spotify connection status.
- `POST /spotify/disconnect`: protected; marks scaffolded Spotify accounts disconnected.

## Worker Behavior

The TypeScript worker is the active Stage 1 worker.

For `generate_recommendations` messages it:

- Marks the durable job running.
- Marks the recommendation request running.
- Ensures deterministic placeholder catalog rows exist.
- Inserts placeholder recommendation results/items.
- Marks the recommendation request and job completed.
- Deletes the SQS message after successful processing.

The placeholder recommendation path is temporary. Replace it later with resolver, mapper, enrichment, embedding, vector search, ranking, and explanation services.

## Database

Canonical schema files:

- `db/schema.sql`
- `db/migrations/001_initial_schema.sql`
- `db/seed.sql`

When schema changes affect app behavior, update all relevant schema/migration/seed files and README setup notes. Keep Supabase compatibility in mind.

## Verification Expectations

Before finishing code changes, run when possible:

```bash
pnpm check
```

`pnpm check` runs typecheck, lint, and format:check.

For changes touching local infrastructure or DB setup, also validate:

```bash
docker compose config
```

For API/worker behavior changes, prefer an end-to-end local check with Postgres and LocalStack running.

For queue failure behavior, a manual smoke check is acceptable: stop LocalStack or use a bogus `SQS_RECOMMENDATION_QUEUE_URL`, submit a recommendation request, confirm HTTP 503 with `QUEUE_UNAVAILABLE`, and confirm the created request/job rows are marked failed.

## Documentation Maintenance

Update this file when changes affect:

- How the app works.
- How the app runs.
- Project structure.
- Required environment variables.
- Commands or verification steps.
- API routes or worker behavior.
- New features or intentionally stubbed boundaries.
