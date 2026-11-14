import { createHash } from "node:crypto"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import process from "node:process"

import { linkedProject, serviceRoleKey, supabaseCli } from "../project/index.js"

const FUNCTIONS_ENV = path.join("supabase", "functions", ".env")
const ENV_LINE = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/
const QUOTED = /^(["'])(?<value>.*)\1$/
const OWNER_ONLY = 0o600

/**
 * Tells the linked project's database how to reach its Edge Functions:
 * stores `project_url` and the legacy `service_role_key` in Vault, creating
 * or updating them, for SQL that calls functions with `pg_net`.
 *
 * @param {{ cwd?: string, cli?: typeof supabaseCli }} [options]
 * @returns {{ ref: string, names: string[] }}
 */
export function pushVaultSecrets({
  cwd = process.cwd(),
  cli = supabaseCli,
} = {}) {
  const { ref, projectUrl } = linkedProject(cwd)
  const secrets = {
    project_url: projectUrl,
    service_role_key: serviceRoleKey(ref, cli),
  }
  withSecretFile("secrets.sql", vaultSql(secrets), (file) =>
    cli(["db", "query", "--linked", "--file", file]),
  )
  return { ref, names: Object.keys(secrets) }
}

/**
 * Sets the linked project's Edge Function secrets from
 * `supabase/functions/.env`, all of them or the ones named, then reads back
 * their fingerprints to check that each arrived as it is locally.
 *
 * @param {{ cwd?: string, names?: string[], cli?: typeof supabaseCli }} [options]
 * @returns {{ ref: string, results: { name: string, isSame: boolean }[] }}
 */
export function pushFunctionSecrets({
  cwd = process.cwd(),
  names = [],
  cli = supabaseCli,
} = {}) {
  const { ref } = linkedProject(cwd)
  const lines = readFileSync(path.join(cwd, FUNCTIONS_ENV), "utf8")
    .split("\n")
    .map((line) => line.match(ENV_LINE))
    .filter(Boolean)
    .filter(([, name]) => !names.length || names.includes(name))

  const missing = names.filter((name) => !lines.some(([, n]) => n === name))
  if (missing.length) {
    throw new Error(`Not in ${FUNCTIONS_ENV}: ${missing.join(", ")}`)
  }
  if (!lines.length) throw new Error(`No secrets in ${FUNCTIONS_ENV}`)

  withSecretFile(
    "secrets.env",
    `${lines.map(([line]) => line).join("\n")}\n`,
    (file) => cli(["secrets", "set", "--project-ref", ref, "--env-file", file]),
  )

  // Supabase only ever shows a secret's SHA-256, which is enough to compare.
  const listed = JSON.parse(
    cli(["secrets", "list", "--project-ref", ref, "-o", "json"]),
  )
  const remote = new Map(
    (listed.secrets ?? listed).map(({ name, value }) => [name, value]),
  )
  const results = lines.map(([, name, raw]) => {
    const value = raw.match(QUOTED)?.groups.value ?? raw
    const digest = createHash("sha256").update(value).digest("hex")
    return { name, isSame: remote.get(name) === digest }
  })
  return { ref, results }
}

function vaultSql(secrets) {
  const upserts = Object.entries(secrets).map(([name, value]) => {
    const literal = (text) => `'${text.replaceAll("'", "''")}'`
    return `  select id into v_id from vault.secrets where name = ${literal(name)};
  if v_id is null then
    perform vault.create_secret(${literal(value)}, ${literal(name)});
  else
    perform vault.update_secret(v_id, ${literal(value)});
  end if;`
  })
  return `do $$
declare
  v_id uuid;
begin
${upserts.join("\n")}
end;
$$;
`
}

function withSecretFile(name, content, use) {
  const dir = mkdtempSync(path.join(tmpdir(), "inglorious-supabase-"))
  const file = path.join(dir, name)
  try {
    writeFileSync(file, content, { mode: OWNER_ONLY })
    return use(file)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}
