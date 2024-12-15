import { createClient } from '@libsql/client'

const TURSO_URL = process.env.TURSO_URL
const TURSO_TOKEN = process.env.TURSO_TOKEN

if (!TURSO_TOKEN) res.status(500).json({error: 'Missing Turso token'})
if (!TURSO_URL) res.status(500).json({error: 'Missing Turso URL'})

export const client = createClient({url: TURSO_URL, authToken: TURSO_TOKEN})

// Because the libsql client.execute returns an annoying format,
// this parses it into an array of objects
export function parseData(input) {
	const columns = input.columns
	const rows = input.rows
	return rows.map((row) => {
		let obj = {}
		for (let i = 0; i < columns.length; i++) {
			obj[columns[i]] = row[i]
		}
		return obj
	})
}

