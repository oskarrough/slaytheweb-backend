# Slay the Web backend

A node.js backend API for [Slay the Web](https://github.com/oskarrough/slaytheweb) used to post and store highscores.

It is deployed and live on https://api.slaytheweb.cards

It contains three API endpoints:

```
GET /api/runs - returns all runs (but not all data per run)
GET /api/runs/{id} - returns a single run
POST /api/runs  - record a run
```

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

## Schema

There are two tables: `players` and `runs`. Every run stores a reference to the name of a player.

There is no authentication, and player names are not protected. C'est la vie.

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
