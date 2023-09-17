# Slay the Web backend

Contains two API endpoints:

```
GET /api/runs - returns all submitted runs
POST /api/runs  - record a run
```

- https://api.slaytheweb.cards

## How is it made?

A Node.js API (built with [Next.js](https://nextjs.org/)) which connects to a remote `libsql` (fork of sqlite) database running on a `sqld` server, hosted by https://turso.tech.

## Development

Link the project with Vercel in order to get the environment variables:

```bash
vercel link
```

followed by

```bash
vercel env pull .env.local
```

you should see `TURSO_URL` and `TURSO_TOKEN`.

and finally, to run the development server:

```bash
npm run dev
```

## More dev tips

```
turso db shell rare-neon
.read schema.sql
insert into players (name) values ('Jaw Worm')
insert into runs (player, game_state) values ('Jaw Worm', '{turn: 42, hello: "world"}')
select * from runs;
```

if the server is running locally, you can do:

```
curl -X POST --header 'Content-Type: application/json' -d '{"player": "XX", "won": 1}' http://localhost:3000/api/runs
```
