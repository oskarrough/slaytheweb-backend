# Slay the Web backend

Contains two API endpoints:

```
GET /api/runs - returns a list of maximum 100 runs
POST /api/runs  - record a save game 
```

## How is it made?

`libsql` (fork of sqlite) running on a `sqld` server hosted by turso.tech.

- https://docs.turso.tech/reference/client-access/javascript-typescript-sdk


```
curl -X POST --header 'Content-Type: application/json' -d '{"player": "XX", "won": 1}' http://localhost:3000/api/runs
```

```
turso db shell rare-neon
.read schema.sql
select * from runs;
```

### SQLite extensions

- https://docs.turso.tech/reference/extensions
- https://github.com/nalgeon/sqlean/blob/main/docs/uuid.md

## Development

Link the project with Vercel in order to get the environment variables:

```bash
vercel link
```

followed by

```bash
vercel env pull .env.local
```

and finally, to run the development server:

```bash
npm run dev
```

## Links

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
