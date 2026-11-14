import { createHash } from "node:crypto"
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { pushFunctionSecrets, pushVaultSecrets } from "./index.js"

const REF = "abcdefghijklmnop"
const SERVICE_KEY = "service-key"
const API_KEYS = [
  { name: "anon", type: "legacy", api_key: "anon-key" },
  { name: "service_role", type: "legacy", api_key: SERVICE_KEY },
]

describe("secrets", () => {
  let cwd

  beforeEach(() => {
    cwd = mkdtempSync(path.join(tmpdir(), "inglorious-supabase-test-"))
    mkdirSync(path.join(cwd, "supabase", ".temp"), { recursive: true })
    mkdirSync(path.join(cwd, "supabase", "functions"), { recursive: true })
    writeFileSync(
      path.join(cwd, "supabase", ".temp", "project-ref"),
      `${REF}\n`,
    )
  })

  afterEach(() => {
    rmSync(cwd, { recursive: true, force: true })
  })

  it("stores the project URL and service role key in Vault", () => {
    const cli = fakeCli()

    const result = pushVaultSecrets({ cwd, cli })

    expect(result).toEqual({
      ref: REF,
      names: ["project_url", "service_role_key"],
    })
    const [, query] = cli.calls
    expect(query.args.slice(0, 3)).toEqual(["db", "query", "--linked"])
    expect(query.file).toContain(
      `vault.create_secret('https://${REF}.supabase.co', 'project_url')`,
    )
    expect(query.file).toContain(`vault.update_secret(v_id, '${SERVICE_KEY}')`)
  })

  it("sets function secrets and compares their fingerprints", () => {
    writeEnv(
      cwd,
      "FCM_SERVICE_ACCOUNT='{\"a\":1}'\nRESEND_KEY=re_1\n# comment\n",
    )
    const cli = fakeCli({
      secrets: [
        { name: "FCM_SERVICE_ACCOUNT", value: sha256('{"a":1}') },
        { name: "RESEND_KEY", value: sha256("old") },
      ],
    })

    const { results } = pushFunctionSecrets({ cwd, cli })

    expect(results).toEqual([
      { name: "FCM_SERVICE_ACCOUNT", isSame: true },
      { name: "RESEND_KEY", isSame: false },
    ])
    const set = cli.calls.find(({ args }) => args[1] === "set")
    expect(set.file).toBe("FCM_SERVICE_ACCOUNT='{\"a\":1}'\nRESEND_KEY=re_1\n")
  })

  it("sets only the secrets named, and refuses unknown names", () => {
    writeEnv(cwd, "A=1\nB=2\n")
    const cli = fakeCli({ secrets: [] })

    pushFunctionSecrets({ cwd, names: ["B"], cli })
    expect(cli.calls.find(({ args }) => args[1] === "set").file).toBe("B=2\n")

    expect(() => pushFunctionSecrets({ cwd, names: ["C"], cli })).toThrow(
      "Not in supabase/functions/.env: C",
    )
  })

  it("asks for supabase link when no project is linked", () => {
    rmSync(path.join(cwd, "supabase", ".temp"), { recursive: true })

    expect(() => pushVaultSecrets({ cwd, cli: fakeCli() })).toThrow(
      "run supabase link first",
    )
  })
})

function writeEnv(cwd, content) {
  writeFileSync(path.join(cwd, "supabase", "functions", ".env"), content)
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex")
}

function fakeCli({ secrets = [] } = {}) {
  const cli = (args) => {
    const fileIndex = args.findIndex(
      (arg) => arg === "--file" || arg === "--env-file",
    )
    cli.calls.push({
      args,
      file: fileIndex < 0 ? null : readFileSync(args[fileIndex + 1], "utf8"),
    })
    if (args[0] === "projects") return JSON.stringify(API_KEYS)
    if (args[1] === "list") return JSON.stringify(secrets)
    return ""
  }
  cli.calls = []
  return cli
}
