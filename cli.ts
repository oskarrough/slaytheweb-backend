#!/usr/bin/env bun
import {Database} from 'bun:sqlite'

const API = 'https://api.slaytheweb.cards'
const db = new Database('runs.db')

db.run(`create table if not exists runs (
	id integer primary key,
	player text,
	created_at integer,
	ended_at integer,
	floor integer,
	won integer
)`)

function table(rows: Record<string, unknown>[]) {
	if (!rows.length) return
	const keys = Object.keys(rows[0])
	console.log(keys.join('\t'))
	for (const r of rows) console.log(Object.values(r).join('\t'))
}

const commands: Record<string, (arg?: string) => void | Promise<void>> = {
	async pull() {
		const lastId = db.query('select max(id) as id from runs').get() as {id: number | null}
		const localMax = lastId?.id || 0
		console.log(`Local: ${localMax} runs`)

		const res = await fetch(`${API}/api/runs`)
		const {total, runs} = (await res.json()) as {total: number; runs: {id: number; player: string; createdAt: number; endedAt: number; floor: number; won: number}[]}
		const fresh = runs.filter((r) => r.id > localMax)

		if (!fresh.length) return console.log('Up to date.')

		const ins = db.prepare('insert or ignore into runs values (?,?,?,?,?,?)')
		for (const r of fresh) ins.run(r.id, r.player, r.createdAt, r.endedAt, r.floor, r.won)

		console.log(`+${fresh.length} runs (${total} total)`)
	},

	query(sql?: string) {
		if (!sql) return console.log('Usage: ./cli.ts query "SELECT ..."')
		table(db.query(sql).all() as Record<string, unknown>[])
	},

	stats() {
		const rows = db.query(`select
			count(*) as total,
			sum(won) as wins,
			round(100.0 * sum(won) / count(*), 1) as 'win%',
			round(avg(floor), 1) as avg_floor,
			round(avg(ended_at - created_at) / 1000) as avg_sec
		from runs`).all() as Record<string, unknown>[]
		table(rows)
	},

	top() {
		const rows = db.query(`select player, count(*) as runs, sum(won) as wins
			from runs group by player order by runs desc limit 10`).all() as Record<string, unknown>[]
		table(rows)
	},

	daily() {
		const rows = db.query(`select date(created_at/1000, 'unixepoch') as day, count(*) as n
			from runs group by day order by day desc limit 14`).all() as Record<string, unknown>[]
		table(rows)
	},

	async verify(url?: string) {
		const base = url || API
		console.log(`Testing ${base}\n`)

		// Get a real run ID first
		const runsRes = await fetch(`${base}/api/runs`)
		const runsData = (await runsRes.json()) as {runs: {id: number}[]}
		const testId = runsData.runs[0]?.id || 1

		const tests = [
			{name: 'GET /api/runs', path: '/api/runs', check: (d: any) => typeof d.total === 'number' && Array.isArray(d.runs)},
			{name: `GET /api/runs/${testId}`, path: `/api/runs/${testId}`, check: (d: any) => d && typeof d.id === 'number'},
			{name: 'GET /api/top20', path: '/api/top20', check: (d: any) => Array.isArray(d)},
		]

		for (const t of tests) {
			try {
				const res = await fetch(`${base}${t.path}`)
				const data = await res.json()
				const ok = t.check(data)
				console.log(`${ok ? '✓' : '✗'} ${t.name}`)
				if (!ok) console.log('  Unexpected response:', JSON.stringify(data).slice(0, 100))
			} catch (e) {
				console.log(`✗ ${t.name}`)
				console.log(`  Error: ${e}`)
			}
		}

		// Test CORS preflight
		try {
			const res = await fetch(`${base}/api/runs`, {method: 'OPTIONS'})
			const cors = res.headers.get('access-control-allow-origin')
			console.log(`${cors ? '✓' : '✗'} OPTIONS /api/runs (CORS)`)
		} catch (e) {
			console.log(`✗ OPTIONS /api/runs (CORS)`)
		}
	},
}

const [cmd, arg] = process.argv.slice(2)
if (cmd && cmd in commands) {
	await commands[cmd](arg)
} else {
	console.log(`Usage: ./cli.ts <command>

Commands:
  pull            Fetch new runs from API
  query "SQL"     Run SQL on local DB
  stats           Show overall statistics
  top             Top players by run count
  daily           Runs per day
  verify [url]    Test API endpoints (default: ${API})`)
}
