import { createClient } from '@libsql/client'

// Create a Turso client using Cloudflare Worker env bindings
export function createTursoClient(env) {
	return createClient({
		url: env.TURSO_URL,
		authToken: env.TURSO_TOKEN,
	})
}

// Parse libsql result format into an array of objects
export function parseData(input) {
	const columns = input.columns
	const rows = input.rows
	return rows.map((row) => {
		const obj = {}
		for (let i = 0; i < columns.length; i++) {
			obj[columns[i]] = row[i]
		}
		return obj
	})
}
