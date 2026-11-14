import { EventEmitter } from "node:events"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { dev } from "./index.js"

const CAPACITOR_CONFIG = {
  appId: "com.example.app",
  appName: "Example",
  webDir: "dist",
}

describe("dev", () => {
  let root

  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), "inglorious-capacitor-dev-"))
    writeFileSync(path.join(root, "package.json"), "{}")
    writeFileSync(
      path.join(root, "capacitor.config.json"),
      JSON.stringify(CAPACITOR_CONFIG),
    )
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it("serves Vite on the network and runs the app against it", async () => {
    buildWebDir(root)
    const spawn = fakeSpawn()

    const code = await dev({
      root,
      platform: "ios",
      args: ["--target", "ABC"],
      spawn,
      isReady: async () => true,
    })

    expect(code).toBe(0)
    expect(spawn.calls).toEqual([
      ["vite", ["--host", "--port", "5173", "--strictPort"]],
      [
        "cap",
        ["run", "ios", "--live-reload", "--port", "5173", "--target", "ABC"],
      ],
    ])
    expect(spawn.children[0].kill).toHaveBeenCalled()
  })

  it("builds the web app first when it was never built", async () => {
    const spawn = fakeSpawn()

    await dev({
      root,
      platform: "android",
      port: 3000,
      spawn,
      isReady: async () => true,
    })

    expect(
      spawn.calls.map(([command, args]) => `${command} ${args[0]}`),
    ).toEqual(["vite build", "vite --host", "cap run"])
  })

  it("stops the dev server when the app fails", async () => {
    buildWebDir(root)
    const spawn = fakeSpawn({ cap: 1 })

    await expect(
      dev({ root, platform: "android", spawn, isReady: async () => true }),
    ).rejects.toThrow("exited with 1")
    expect(spawn.children[0].kill).toHaveBeenCalled()
  })

  it("refuses an unknown platform", async () => {
    await expect(dev({ root, platform: "web" })).rejects.toThrow("Usage")
  })
})

function buildWebDir(root) {
  mkdirSync(path.join(root, "dist"))
  writeFileSync(path.join(root, "dist", "index.html"), "")
}

function fakeSpawn(exitCodes = {}) {
  const spawn = (command, args) => {
    spawn.calls.push([command, args])
    const child = Object.assign(new EventEmitter(), { kill: vi.fn() })
    spawn.children.push(child)
    const isServer = command === "vite" && args[0] === "--host"
    if (!isServer) setTimeout(() => child.emit("exit", exitCodes[command] ?? 0))
    return child
  }
  spawn.calls = []
  spawn.children = []
  return spawn
}
