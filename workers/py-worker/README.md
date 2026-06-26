# Python Worker

This worker is a placeholder for future recommendation and ML-heavy work:

- Metadata feature extraction.
- Embedding generation.
- Supabase pgvector lookup helpers.
- Ranking experiments.
- Taste clustering.

It is not connected to SQS yet. The TypeScript worker owns Stage 1 placeholder job processing.

## Local setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
python -m py_worker.main
```
