import { execFileSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

const PROJECT_REF_FILE = path.join("supabase", ".temp", "project-ref")

/**
 * The project `supabase link` linked, and its address.
 *
 * @param {string} cwd The app's folder.
 * @returns {{ ref: string, projectUrl: string }}
 */
export function linkedProject(cwd) {
  const file = path.join(cwd, PROJECT_REF_FILE)
  if (!existsSync(file)) {
    throw new Error("No linked project: run supabase link first")
  }
  const ref = readFileSync(file, "utf8").trim()
  return { ref, projectUrl: `https://${ref}.supabase.co` }
}

/**
 * The project's legacy service role key, asked of the Supabase CLI's login,
 * so it is never written down.
 *
 * @param {string} ref
 * @param {typeof supabaseCli} [cli]
 */
export function serviceRoleKey(ref, cli = supabaseCli) {
  const keys = JSON.parse(
    cli(["projects", "api-keys", "--project-ref", ref, "-o", "json"]),
  )
  const key = keys.find(
    ({ name, type }) => name === "service_role" && type === "legacy",
  )?.api_key
  if (!key) throw new Error("No legacy service_role key found")
  return key
}

/**
 * Runs the Supabase CLI and returns what it printed; its errors go to the
 * terminal.
 *
 * @param {string[]} args
 */
export function supabaseCli(args) {
  return execFileSync("supabase", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  })
}
