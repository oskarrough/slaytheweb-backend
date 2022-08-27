# Slay the Web backend

Contains two API endpoints:

```
GET /api/runs - returns a list of maximum 100 runs
POST /api/runs  - record a save game 
```

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
