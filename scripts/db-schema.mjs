console.log(`Database schema files:

- db/schema.sql: canonical local/Supabase-compatible schema.
- db/migrations/001_initial_schema.sql: initial migration copy.
- db/seed.sql: local seed data.

Local Docker Postgres applies db/schema.sql and db/seed.sql on first volume creation.
For Supabase, run db/schema.sql in the SQL editor or apply the migration through your migration flow.
`);
