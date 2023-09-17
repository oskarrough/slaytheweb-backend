import Cors from 'cors'
import { client } from '../../src/db'

const cors = Cors({
	methods: ['GET', 'POST', 'HEAD'],
})

export default async function handler(req, res) {
	await runMiddleware(req, res, cors)

	if (req.method === 'GET') {
		const runs = await fetchRuns()
		return res.status(200).json({ runs })
	}

	if (req.method === 'POST') {
		const result = await postRunToDatabase(req.body)
		return res.status(200).json({ msg: 'ok', result })
	}

	res.status(200).json({ msg: 'hm nop' })
}

async function fetchRuns() {
	const res = await client.execute(`
    select
      id, 
      player, 
      --json_extract(game_state, "$.createdAt") as createdAt,
      --json_extract(game_state, "$.endedAt") as endedAt,
      --json_extract(game_state, "$.turn") as turn, 
      --json_extract(game_state, "$.won") as won, 
      game_state as gameState,
      game_past as gamePast
    from runs
    where game_state is not null
  `)
	const parsed = parseData(res)
	return parsed.map((run) => {
		run.gameState = JSON.parse(run.gameState ?? '{}')
		run.gamePast = JSON.parse(run.gamePast ?? '[]')
		return run
	})
}

async function postRunToDatabase(body) {
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

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
	return new Promise((resolve, reject) => {
		fn(req, res, (result) => {
			if (result instanceof Error) {
				return reject(result)
			}
			return resolve(result)
		})
	})
}

function parseData(input) {
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
