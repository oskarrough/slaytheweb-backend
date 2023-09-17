import { createClient } from '@libsql/client'

const TURSO_URL = process.env.TURSO_URL
const TURSO_TOKEN = process.env.TURSO_TOKEN

if (!TURSO_TOKEN) res.status(500).json({error: 'Missing Turso token'})
if (!TURSO_URL) res.status(500).json({error: 'Missing Turso URL'})

export const client = createClient({url: TURSO_URL, authToken: TURSO_TOKEN})


