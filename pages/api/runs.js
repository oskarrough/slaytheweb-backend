import Cors from 'cors'
import { client } from '../../src/db'

const cors = Cors({
	methods: ['GET', 'POST', 'HEAD'],
})

export default async function handler(req, res) {
	await runMiddleware(req, res, cors)

	if (req.method === 'GET') {
		const runs = await getRuns()
		return res.status(200).json({ runs })
	}

	if (req.method === 'POST') {
		const result = await postRun(req.body)
		return res.status(200).json({ msg: 'ok', result })
	}

	res.status(200).json({ msg: 'hm nop' })
}

async function getRuns() {
	const res = await client.execute(`
    select
      id, 
      player, 
      --json_extract(game_state, "$.createdAt") as createdAt,
      --json_extract(game_state, "$.endedAt") as endedAt,
      --json_extract(game_state, "$.turn") as turn, 
      --json_extract(game_state, "$.won") as won, 
      game_state as gameState
      --game_past as gamePast
    from runs
    where game_state is not null
  `)
	const parsed = parseData(res)
	return parsed.map((run) => {
		run.gameState = minimizeGameState(JSON.parse(run.gameState)) 
		run.gamePast = JSON.parse(run.gamePast ?? '[]')
		return run
	})
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
					gameState: JSON.stringify(minimizeGameState(body.gameState)),
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

// Apparently it's too much data to send around, so I try to remove a bit.
function minimizeGameState(state) {
	const mini = {...state}
	delete mini.dungeon?.graph
	delete mini.dungeon?.paths
	delete mini.dungeon?.pathTaken
	delete mini.drawPile
	delete mini.hand
	delete mini.discardPile
	delete mini.exhaustPile
	mini.deck = mini.deck.map(card => {
		return card.name
	})
	return mini
}

