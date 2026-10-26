import { defineConfig } from 'cf/config'

export default defineConfig({
	worker: {
		name: 'slaytheweb-api',
		compatibilityDate: '2026-05-26',
		entrypoint: 'worker.js',
		observability: {
			logs: {
				enabled: true,
				invocationLogs: true,
			},
		},
	},
})
