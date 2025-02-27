import { client, parseData } from '../../utils/db'
import { runMiddleware, cors } from '../../utils/cors-middleware'

export default async function handler(req, res) {
	await runMiddleware(req, res, cors)

	if (req.method === 'GET') {
		const total = await getTotalRuns()
		const runs = await getRuns()
		return res.status(200).json({ total, runs })
	}

	if (req.method === 'POST') {
		const result = await postRun(req.body)
		return res.status(200).json({ msg: 'ok', result })
	}

	res.status(200).json({ msg: 'hm nop' })
}

async function getTotalRuns() {
	const res = await client.execute(`select count(id) as count from runs;`)
	return res.rows[0].count
}

// Returns a subset of the data for each run to keep it light(er).
async function getRuns() {
	const res = await client.execute(`
    select
      id, 
      player,
      json_extract(game_state, "$.createdAt") as createdAt,
      json_extract(game_state, "$.endedAt") as endedAt,
      json_extract(game_state, "$.dungeon.y") as floor, 
      json_extract(game_state, "$.won") as won
    from runs
		order by id desc
  `)
	const parsed = parseData(res)
	return parsed
}

async function postRun(body) {
	try {
		const what = await client.batch([
			{
				sql: 'insert or ignore into players (name) values(:name)',
				args: { name: body.player },
			},
			{
				sql: 'insert into runs (player, game_state, game_past) values(:player, :gameState, :gamePast)',
				args: {
					player: body.player,
					gameState: JSON.stringify(body.gameState),
					gamePast: JSON.stringify(body.gamePast),
				},
			},
		])
		return what
	} catch (e) {
		console.error(e)
	}
}

