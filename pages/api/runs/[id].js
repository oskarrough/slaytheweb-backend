import Cors from 'cors'
import { client, parseData } from '../../../utils/db'
import { runMiddleware } from '../../utils/cors-middleware'

const cors = Cors({
	methods: ['GET', 'POST', 'HEAD'],
})

export default async function handler(req, res) {
	await runMiddleware(req, res, cors)

	if (req.method !== 'GET') {
		return res.status(500, 'only get allowed')
	}

	const run = await getRun(req.query.id)
	return res.status(200).json(run)
}

async function getRun(id) {
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
		args: [id]
	})
	const parsed = parseData(res)
	return parsed.map((run) => {
		run.gameState = JSON.parse(run.gameState)
		run.gamePast = JSON.parse(run.gamePast ?? '[]')
		return run
	})[0]
}
