import Cors from 'cors'

/**
 * Helper method to wait for a middleware to execute before continuing. 
 * And to throw an error when an error happens in a middleware
 * @param {*} req 
 * @param {*} res 
 * @param {*} fn 
 * @returns 
 */
export function runMiddleware(req, res, fn) {
	return new Promise((resolve, reject) => {
		fn(req, res, (result) => {
			if (result instanceof Error) {
				return reject(result)
			}
			return resolve(result)
		})
	})
}

export const cors = Cors({
	methods: ['GET', 'POST', 'HEAD'],
})
