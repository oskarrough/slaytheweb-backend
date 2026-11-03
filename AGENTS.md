# slaytheweb-backend

- Deploys run through `cf deploy`, which is strict: if `cloudflare.config.ts` differs from the live Worker (domains, compatibilityDate, observability, workersDev, previewUrls), it aborts and the Workers Builds run fails. Change settings in the config, not the dashboard, and read the diff in the build log (`cf builds logs get <build-uuid>`).
