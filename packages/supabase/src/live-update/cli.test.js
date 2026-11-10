import { homedir } from "node:os"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { privateKeyPath, pushesAppChanges } from "./cli.js"

const HEAD = "b".repeat(40)
const REMOTE = "a".repeat(40)
const NEW_BRANCH = "0".repeat(40)

function refs(remoteRef, localSha = HEAD, remoteSha = REMOTE) {
  return `refs/heads/main ${localSha} ${remoteRef} ${remoteSha}\n`
}

function git(files) {
  return { head: HEAD, changedFiles: () => files }
}

describe("pushesAppChanges", () => {
  it("publishes when main gets a change to the app", () => {
    expect(pushesAppChanges(refs("refs/heads/main"), git(["src/app.js"]))).toBe(
      true,
    )
  })

  it("skips docs, the landing page, the backend and other branches", () => {
    const outside = git(["docs/a.md", "landing/index.html", "supabase/x.sql"])
    expect(pushesAppChanges(refs("refs/heads/main"), outside)).toBe(false)
    expect(
      pushesAppChanges(refs("refs/heads/feature"), git(["src/a.js"])),
    ).toBe(false)
  })

  it("publishes a new main, and never a commit other than HEAD", () => {
    expect(
      pushesAppChanges(refs("refs/heads/main", HEAD, NEW_BRANCH), git([])),
    ).toBe(true)
    expect(
      pushesAppChanges(refs("refs/heads/main", REMOTE), git(["src/a.js"])),
    ).toBe(false)
    expect(pushesAppChanges("", git(["src/a.js"]))).toBe(false)
  })
})

describe("privateKeyPath", () => {
  it("keeps the key outside the project, unless told otherwise", () => {
    expect(privateKeyPath("shop", {})).toBe(
      path.join(homedir(), ".config", "shop", "live-update.pem"),
    )
    expect(privateKeyPath("shop", { LIVE_UPDATE_PRIVATE_KEY: "/k.pem" })).toBe(
      "/k.pem",
    )
  })
})
