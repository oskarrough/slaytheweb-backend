import Cors from 'cors'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY

const cors = Cors({
	methods: ['GET', 'POST', 'HEAD']
})

export default async function handler(req, res) {
	await runMiddleware(req, res, cors)
	if (!AIRTABLE_API_KEY) res.status(500).json({error: 'missing api key'})
	if (req.method === 'GET') {
		const result = await fetchRuns()
		const runs = await result.json()
  	return res.status(200).json({runs})
	}
	if (req.method === 'POST') {
		const result = await postRunToDatabase(req.body)
  	return res.status(201).json({message: 'saved'})
	}
	res.status(200).json({msg:'hm nop'})
}

async function postRunToDatabase(state) {
	const airtableFormat = {
		records: [
			{
				fields: {
					name: 'PlayerX',
					status: 'Win',
					state: JSON.stringify(state)
				}
			}
		]
	}
	return fetch('https://api.airtable.com/v0/apph0njNBz1Qj9FSj/Runs', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${AIRTABLE_API_KEY}`,
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(airtableFormat)
	})
}

async function fetchRuns(state) {
	return fetch('https://api.airtable.com/v0/apph0njNBz1Qj9FSj/Runs?maxRecords=999&view=Grid%20view', {
		headers: {
			Authorization: `Bearer ${AIRTABLE_API_KEY}`,
		}
	})
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