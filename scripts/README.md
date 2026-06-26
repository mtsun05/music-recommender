# Local Scripts

Use these from the repo root.

```bash
pnpm local:up
pnpm dev:api
pnpm dev:worker
pnpm dev:web
```

`pnpm dev` starts the API, web app, and TypeScript worker together. Running the three dev commands separately can make logs easier to read while debugging.

Useful checks:

```bash
pnpm check
```

Schema guidance:

```bash
pnpm db:schema
```
