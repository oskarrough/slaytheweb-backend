import { createClient } from "@libsql/client/web"

export function tursoClient(requestEvent) {
  const url = requestEvent.env.get("TURSO_DB_URL")
  if (url === undefined) throw Error("TURSO_DB_URL must be provided!")

  const authToken = requestEvent.env.get("TURSO_DB_AUTH_TOKEN")
  if (authToken === undefined) throw Error("TURSO_DB_AUTH_TOKEN must be provided!")

  return createClient({
    url,
    authToken
  })
}
