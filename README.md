# Slay the Web backend

A REST API for [Slay the Web](https://github.com/oskarrough/slaytheweb) to post and store highscores.

It is deployed and live on https://api.slaytheweb.cards with three endpoints:

```
GET /api/runs - returns all runs (but not all data per run)
GET /api/runs/{id} - returns a single run
POST /api/runs  - stores a run
```

## How is it made?

A Node.js API (built with [Next.js](https://nextjs.org/)) which connects to a remote `libsql` (fork of sqlite) database running on a `sqld` server, hosted by https://turso.tech.

## Development

Copy `.env.example` to `.env` and add your Turso token. Or pull from Vercel:

```bash
vercel link && vercel env pull .env
```

Run the dev server:

```bash
npm run dev
```

## Schema

Two tables: `players` and `runs`. No authentication, player names are not protected.

```sql
players(name TEXT PRIMARY KEY, created_at INTEGER)
runs(id INTEGER PRIMARY KEY, created_at INTEGER, player TEXT, won INTEGER, game_state BLOB, game_past BLOB)
```

Note: `game_state` is minimized via `minimizeGameState()`, not the full state.

## Query tools

Run SQL directly against Turso (requires `.env` with `TURSO_URL` and `TURSO_TOKEN`):

```bash
bun query.js "SELECT * FROM runs ORDER BY id DESC LIMIT 5"
bun query.js "SELECT count(*) FROM players"
```

Local analytics (synced subset without blobs):

```bash
bun runs.js sync    # fetch latest from API
bun runs.js stats   # show stats
bun runs.js top     # top players
bun runs.js daily   # runs per day
bun runs.js query "SELECT ..."
```

## Turso shell

```bash
turso db shell rare-neon
```

## Local testing

```bash
curl -X POST -H 'Content-Type: application/json' -d '{"player": "XX", "won": 1}' http://localhost:3000/api/runs
```
