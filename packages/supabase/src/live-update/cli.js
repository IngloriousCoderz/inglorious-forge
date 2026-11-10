import { execFileSync } from "node:child_process"
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  symlinkSync,
  writeFileSync,
} from "node:fs"
import { homedir, tmpdir } from "node:os"
import path from "node:path"
import process from "node:process"
import { parseEnv } from "node:util"

import { generateLiveUpdateKeys, publishLiveUpdate } from "./index.js"

export const PUBLIC_KEY_FILE = "live-update.pub.pem"

const MS_PER_SECOND = 1000
const NO_MIN_BUILD = 0
const NO_REMOTE = /^0+$/
const MAIN_REF = "refs/heads/main"
const NOT_THE_APP = [
  /^landing\//,
  /^docs\//,
  /^supabase\//,
  /^\.changeset\//,
  /^\.github\//,
  /\.md$/,
]

/** Where the private key lives: never in the project. */
export function privateKeyPath(projectName, env = process.env) {
  return (
    env.LIVE_UPDATE_PRIVATE_KEY ??
    path.join(homedir(), ".config", projectName, "live-update.pem")
  )
}

/**
 * Whether git is pushing commits to main that change the app, from the refs
 * git hands a pre-push hook on stdin.
 *
 * @param {string} refs Lines of `<local ref> <local sha> <remote ref> <remote sha>`.
 * @param {{ head: string, changedFiles: (from: string, to: string) => string[] }} git
 */
export function pushesAppChanges(refs, { head, changedFiles }) {
  return refs
    .split("\n")
    .map((line) => line.trim().split(" "))
    .filter(([, , remoteRef]) => remoteRef === MAIN_REF)
    .some(([, localSha, , remoteSha]) => {
      if (localSha !== head) return false
      if (NO_REMOTE.test(remoteSha)) return true
      return changedFiles(remoteSha, localSha).some(
        (file) => file && !NOT_THE_APP.some((rule) => rule.test(file)),
      )
    })
}

/** Writes a new key pair: the private one outside the project, the public one in it. */
export function keys(cwd = process.cwd()) {
  const keyPath = privateKeyPath(projectOf(cwd).name)
  if (existsSync(keyPath)) {
    throw new Error(`${keyPath} already exists: keep using it`)
  }
  const { privateKey, publicKey } = generateLiveUpdateKeys()
  mkdirSync(path.dirname(keyPath), { recursive: true })
  writeFileSync(keyPath, privateKey, { mode: 0o600 })
  writeFileSync(path.join(cwd, PUBLIC_KEY_FILE), publicKey)
  console.log(`Private key: ${keyPath} (back it up, never commit it)`)
  console.log(
    `Public key: ${PUBLIC_KEY_FILE} (commit it, then release a new native build)`,
  )
}

/**
 * Builds with Vite, with the production values in `.env` over `.env.local`,
 * stamped with the release that tells newer code from older.
 */
export function build(cwd = process.cwd(), release = nowRelease()) {
  const envFile = path.join(cwd, ".env")
  const fromFile = existsSync(envFile)
    ? parseEnv(readFileSync(envFile, "utf8"))
    : {}
  execFileSync(
    process.execPath,
    [path.join("node_modules", "vite", "bin", "vite.js"), "build"],
    {
      cwd,
      stdio: "inherit",
      env: {
        ...fromFile,
        ...process.env,
        VITE_LIVE_UPDATE_RELEASE: String(release),
      },
    },
  )
  return release
}

/**
 * Builds the committed code from a clean checkout of HEAD, signs it and
 * publishes it. With `onPush`, reads git's refs from stdin and does nothing
 * unless main gets commits that change the app, or without a key.
 */
export async function release({ cwd = process.cwd(), onPush = false } = {}) {
  const git = (...args) =>
    execFileSync("git", args, { cwd, encoding: "utf8" }).trim()

  if (onPush) {
    const refs = await readStdin()
    const isWanted = pushesAppChanges(refs, {
      head: git("rev-parse", "HEAD"),
      changedFiles: (from, to) =>
        git("diff", "--name-only", from, to).split("\n"),
    })
    if (!isWanted) return
  }

  const { name } = projectOf(cwd)
  const keyPath = privateKeyPath(name)
  if (!existsSync(keyPath)) {
    const message = `No live update key at ${keyPath}: run inglorious-live-update keys`
    if (!onPush) throw new Error(message)
    console.log(`${message}. Skipping the live update.`)
    return
  }

  const checkout = mkdtempSync(path.join(tmpdir(), `${name}-live-update-`))
  git("worktree", "add", "--detach", checkout, "HEAD")
  try {
    symlinkSync(
      path.join(cwd, "node_modules"),
      path.join(checkout, "node_modules"),
    )
    if (existsSync(path.join(cwd, ".env"))) {
      copyFileSync(path.join(cwd, ".env"), path.join(checkout, ".env"))
    }
    const stamp = build(checkout)
    const { projectUrl, serviceKey } = supabaseProject(cwd)
    const manifest = await publishLiveUpdate({
      dist: path.join(checkout, "dist"),
      release: stamp,
      minBuild: projectOf(checkout).minBuild,
      privateKey: readFileSync(keyPath, "utf8"),
      projectUrl,
      serviceKey,
    })
    console.log(
      `Live update ${manifest.release} published for builds ${manifest.minBuild} and up.`,
    )
  } finally {
    git("worktree", "remove", "--force", checkout)
  }
}

function projectOf(cwd) {
  const pkg = JSON.parse(readFileSync(path.join(cwd, "package.json"), "utf8"))
  return {
    name: pkg.name,
    minBuild: pkg.liveUpdate?.minBuild ?? NO_MIN_BUILD,
  }
}

// The linked project and its service role key, from the Supabase CLI's login,
// unless SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY say otherwise.
function supabaseProject(cwd, env = process.env) {
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      projectUrl: env.SUPABASE_URL,
      serviceKey: env.SUPABASE_SERVICE_ROLE_KEY,
    }
  }
  const ref = readFileSync(
    path.join(cwd, "supabase", ".temp", "project-ref"),
    "utf8",
  ).trim()
  const apiKeys = JSON.parse(
    execFileSync(
      "supabase",
      ["projects", "api-keys", "--project-ref", ref, "-o", "json"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ),
  )
  const serviceKey = apiKeys.find(
    ({ name, type }) => name === "service_role" && type === "legacy",
  )?.api_key
  if (!serviceKey) throw new Error("No legacy service_role key found")
  return { projectUrl: `https://${ref}.supabase.co`, serviceKey }
}

function nowRelease() {
  return Math.floor(Date.now() / MS_PER_SECOND)
}

async function readStdin() {
  let input = ""
  for await (const chunk of process.stdin) input += chunk
  return input
}
