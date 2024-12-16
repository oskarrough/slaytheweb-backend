import { client, parseData } from '../../utils/db'
import { runMiddleware, cors } from '../../utils/cors-middleware'

export default async function handler(req, res) {
	await runMiddleware(req, res, cors)

	if (req.method !== 'GET') {
		res.status(400).json({ msg: 'only GET requests allowed' })
	}

	const results = await query()
	return res.status(200).json(results)
}

// Returns a subset of the data for each run to keep it light(er).
async function query() {
	const res = await client.execute(`
	select
		id,
		player,
		((JSON_EXTRACT(game_state, "$.createdAt") - JSON_EXTRACT(game_state, "$.endedAt")) / 1000 * -1) as seconds
	from runs
	where JSON_EXTRACT(game_state, "$.won") is 1
	order by seconds asc
	limit 20
  `)
	let parsed = parseData(res)
	return parsed
}
