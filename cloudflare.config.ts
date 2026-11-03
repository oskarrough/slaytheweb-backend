import { defineConfig } from 'cf/config'

// Keep this in sync with the live Worker. `cf deploy` refuses to upload
// when the dashboard config differs from this file.
export default defineConfig({
	worker: {
		name: 'slaytheweb-api',
		compatibilityDate: '2026-10-01',
		entrypoint: 'worker.js',
		domains: ['api.slaytheweb.cards'],
		workersDev: true,
		previewUrls: true,
		observability: {
			logs: {
				enabled: true,
				invocationLogs: true,
			},
			issues: { enabled: true },
			traces: { enabled: true },
		},
	},
})
