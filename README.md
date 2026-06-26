# Music Recommender

Music Recommender is an early-stage scaffold for a music discovery app that should eventually produce better recommendations than Spotify's native recommendations. Spotify is planned for auth-linked user content and basic authorized data, while the long-term recommendation catalog, metadata, embeddings, and vector search are intended to come from open or licensed sources.

## Current MVP Scope

Stage 1 includes:

- Clerk sign-in and a protected dashboard.
- A React + Vite frontend in `apps/web`.
- An Express TypeScript API in `apps/api`.
- Supabase/Postgres schema for users, catalog entities, mappings, recommendation requests/results, vector index bookkeeping, and durable jobs.
- AWS SQS enqueueing from the API.
- A TypeScript SQS worker that processes placeholder recommendation jobs.
- A Python worker scaffold for future embedding, ranking, vector search, and taste clustering work.

The app intentionally does not implement Spotify OAuth, Spotify library import, real metadata enrichment, embeddings, vector search, taste clusters, feedback, billing, admin tools, or production CI/CD yet.

## Architecture

```text
apps/web          Clerk React app and dashboard
apps/api          Express API, Clerk auth, Postgres repositories, SQS enqueueing
workers/ts-worker SQS polling and placeholder recommendation processing
workers/py-worker Future ML/recommendation worker scaffold
packages/shared   Shared TypeScript constants, DTOs, and Zod schemas
db                 Supabase/Postgres schema, migration, and seed data
infra              Local SQS notes and LocalStack setup notes
```

## Tech Stack

- React, Vite, TypeScript
- Express, TypeScript, Zod
- Clerk
- Supabase Postgres with pgvector
- AWS SQS
- pnpm workspaces
- Docker Compose for local Postgres and LocalStack SQS

## Setup

Install dependencies:

```bash
pnpm install
```

Copy env files:

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
cp workers/ts-worker/.env.example workers/ts-worker/.env
```

Fill in Clerk keys:

- `VITE_CLERK_PUBLISHABLE_KEY` in `apps/web/.env.local`
- `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY` in `apps/api/.env`

For local development, the provided defaults use Postgres and LocalStack from Docker Compose.

## Local Services

Start Postgres with pgvector and LocalStack SQS:

```bash
docker compose up -d
```

The Postgres container applies `db/schema.sql` and `db/seed.sql` on first startup. For Supabase, run `db/schema.sql` in the SQL editor or apply `db/migrations/001_initial_schema.sql` through your migration flow.

Local SQS queue:

```text
http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/recommendation-jobs
```

## Run The App

API:

```bash
pnpm dev:api
```

Frontend:

```bash
pnpm dev:web
```

TypeScript worker:

```bash
pnpm dev:worker
```

All three:

```bash
pnpm dev
```

## Useful Checks

```bash
pnpm typecheck
pnpm lint
pnpm format:check
```

## Request Flow

1. A signed-in user opens the dashboard.
2. The frontend calls `GET /me`; the API upserts the Clerk user into `users`.
3. The user submits a music URL or text query.
4. `POST /recommendation-requests` validates the payload, creates a queued `recommendation_requests` row, creates a durable `jobs` row, and sends an SQS message.
5. The TypeScript worker polls SQS, marks the job/request running, inserts deterministic placeholder recommendations, marks both completed, and deletes the SQS message.
6. The frontend polls `GET /recommendation-requests/:id` until completed.

## Stubbed Future Work

The placeholder worker path is deliberately temporary. It will be replaced by:

- Content resolver
- Canonical/open catalog mapper
- Metadata enrichment
- Embedding lookup/generation
- Supabase pgvector search
- Ranking
- Explanation generation
