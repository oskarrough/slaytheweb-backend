import { createTursoClient, parseData } from './db.js'

// CORS headers
const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
}

// JSON response helper
function json(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			...corsHeaders,
		},
	})
}

// Handle OPTIONS preflight
function handleOptions() {
	return new Response(null, { status: 204, headers: corsHeaders })
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url)
		const path = url.pathname
		const method = request.method

		// Handle CORS preflight
		if (method === 'OPTIONS') {
			return handleOptions()
		}

		const client = createTursoClient(env)

		try {
			// GET /api/runs - List all runs (?limit=0 for no limit)
			if (path === '/api/runs' && method === 'GET') {
				const limitParam = url.searchParams.get('limit')
				const limit =
					limitParam === '0'
						? null
						: Math.min(parseInt(limitParam) || 100, 1000)
				const total = await getTotalRuns(client)
				const runs = await getRuns(client, limit)
				return json({ total, runs })
			}

			// POST /api/runs - Create a new run
			if (path === '/api/runs' && method === 'POST') {
				let body
				try {
					body = await request.json()
				} catch {
					return json({ error: 'Invalid JSON body' }, 400)
				}

				if (!body.player || typeof body.player !== 'string') {
					return json({ error: 'Missing or invalid player name' }, 400)
				}
				if (!body.gameState || typeof body.gameState !== 'object') {
					return json({ error: 'Missing or invalid gameState' }, 400)
				}

				const result = await postRun(client, body)
				return json({ msg: 'ok', result })
			}

			// GET /api/runs/:id - Get a specific run
			const runMatch = path.match(/^\/api\/runs\/(\d+)$/)
			if (runMatch && method === 'GET') {
				const id = runMatch[1]
				const run = await getRun(client, id)
				if (!run) {
					return json({ error: 'Run not found' }, 404)
				}
				return json(run)
			}

			// GET /api/top20 - Get top 20 fastest wins
			if (path === '/api/top20' && method === 'GET') {
				const results = await getTop20(client)
				return json(results)
			}

			// GET / - Welcome message
			if (path === '/' && method === 'GET') {
				return new Response(
					'Slay the Web API\n\nAre you lost? Most probably.\nhttps://github.com/oskarrough/slaytheweb-backend',
					{
						headers: {
							'Content-Type': 'text/plain',
							...corsHeaders,
						},
					},
				)
			}

			return json({ error: 'Not found' }, 404)
		} catch (err) {
			console.error('Request failed:', err)
			return json({ error: 'Internal server error' }, 500)
		}
	},
}

async function getTotalRuns(client) {
	const res = await client.execute(`select count(id) as count from runs;`)
	return res.rows[0][0]
}

async function getRuns(client, limit = 100) {
	const sql = `
		select
			id,
			player,
			json_extract(game_state, "$.createdAt") as createdAt,
			json_extract(game_state, "$.endedAt") as endedAt,
			json_extract(game_state, "$.dungeon.y") as floor,
			json_extract(game_state, "$.won") as won
		from runs
		order by id desc
		${limit ? 'limit ?' : ''}
	`
	const res = await client.execute(limit ? { sql, args: [limit] } : sql)
	return parseData(res)
}

async function postRun(client, body) {
	const result = await client.batch([
		{
			sql: 'insert or ignore into players (name) values(:name)',
			args: { name: body.player },
		},
		{
			sql: 'insert into runs (player, game_state, game_past) values(:player, :gameState, :gamePast)',
			args: {
				player: body.player,
				gameState: JSON.stringify(body.gameState),
				gamePast: JSON.stringify(body.gamePast ?? []),
			},
		},
	])
	return result
}

async function getRun(client, id) {
	const res = await client.execute({
		sql: `
			select
				id,
				player,
				created_at,
				game_state as gameState,
				game_past as gamePast
			from runs
			where id = ?
		`,
		args: [id],
	})
	const parsed = parseData(res)
	return parsed.map((run) => {
		run.gameState = JSON.parse(run.gameState)
		run.gamePast = JSON.parse(run.gamePast ?? '[]')
		return run
	})[0]
}

async function getTop20(client) {
	const res = await client.execute(`
		select
			id,
			player,
			((JSON_EXTRACT(game_state, "$.createdAt") - JSON_EXTRACT(game_state, "$.endedAt")) / 1000 * -1) as seconds
		from runs
		where JSON_EXTRACT(game_state, "$.won") = 1
		order by seconds asc
		limit 20
	`)
	return parseData(res)
}
