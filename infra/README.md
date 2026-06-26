# Infrastructure Notes

This scaffold uses managed services in production and local stand-ins for development:

- Supabase Postgres for relational data and future pgvector search.
- AWS SQS for async recommendation jobs.
- Docker Compose for local Postgres with pgvector and LocalStack SQS.

The local stack is intentionally small. It exists so the API and worker contracts can be exercised before real Spotify resolution, metadata enrichment, embeddings, or vector search are implemented.
