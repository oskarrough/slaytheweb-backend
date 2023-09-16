import Cors from "cors"
import { client } from "../../src/db"

const cors = Cors({
  methods: ["GET", "POST", "HEAD"],
})

export default async function handler(req, res) {
  await runMiddleware(req, res, cors)

  if (req.method === "GET") {
    const runs = await fetchRuns()
    return res.status(200).json({ runs })
  }

  if (req.method === "POST") {
    const result = await postRunToDatabase(req.body)
    return res.status(200).json({msg: 'ok', result})
  }

  res.status(200).json({ msg: "hm nop" })
}

async function fetchRuns() {
  const res = await client.execute("select * from runs")
  return parseData(res)
}

async function postRunToDatabase(body) {
  try {
    const what = await client.batch([
      {
        sql: 'insert or ignore into players (name) values(:name)',
        args: { name: body.player },
      },
      {
        sql: 'insert into runs (player, won, game_state) values(:name, :won, :gameState)',
        args: { name: body.player, won: body.won, gameState: body.gameState },
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
    return rows.map(row => {
        let obj = {}
        for (let i = 0; i < columns.length; i++) {
            obj[columns[i]] = row[i]
        }
        return obj
    })
}
