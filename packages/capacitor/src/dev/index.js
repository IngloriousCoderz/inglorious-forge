import { spawn as nodeSpawn } from "node:child_process"
import { existsSync } from "node:fs"
import path from "node:path"
import process from "node:process"

import { readSettings } from "../config.js"

export const DEV_PORT = 5173
const PLATFORMS = ["ios", "android"]
const SUCCESS = 0
const READY_POLL_MS = 250
const READY_TIMEOUT_MS = 30_000

/**
 * Runs the app on a phone or emulator against the Vite dev server on this
 * computer, so every saved file reloads on the device. Vite listens on the
 * local network and `cap run --live-reload` points the native app at it;
 * stopping either stops both, and Capacitor restores the native config.
 *
 * @param {{ root?: string, platform: string, port?: number, args?: string[], spawn?: typeof nodeSpawn, isReady?: (url: string) => Promise<boolean> }} options
 *   `args` go to `cap run`, such as `--target <id>`.
 * @returns {Promise<number>} The exit code of `cap run`.
 */
export async function dev({
  root = process.cwd(),
  platform,
  port = DEV_PORT,
  args = [],
  spawn = nodeSpawn,
  isReady = respondsAt,
}) {
  if (!PLATFORMS.includes(platform)) {
    throw new Error(`Usage: inglorious-capacitor dev <ios|android>`)
  }

  const { webDir } = await readSettings(root, {})
  if (!existsSync(path.join(root, webDir, "index.html"))) {
    await run(spawn, "vite", ["build"], root)
  }

  const commands = devCommands({ platform, port, args })
  const server = spawn(...commands.server, { cwd: root, stdio: "inherit" })
  try {
    await waitFor(() => isReady(`http://localhost:${port}`))
    const ignoreInterrupt = () => {}
    process.on("SIGINT", ignoreInterrupt)
    try {
      return await run(spawn, ...commands.app, root)
    } finally {
      process.off("SIGINT", ignoreInterrupt)
    }
  } finally {
    server.kill()
  }
}

/**
 * The two processes `dev` starts.
 *
 * @param {{ platform: string, port: number, args: string[] }} options
 */
export function devCommands({ platform, port, args }) {
  return {
    server: ["vite", ["--host", "--port", String(port), "--strictPort"]],
    app: [
      "cap",
      ["run", platform, "--live-reload", "--port", String(port), ...args],
    ],
  }
}

function run(spawn, command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit" })
    child.on("error", reject)
    child.on("exit", (code) => {
      if (code)
        reject(new Error(`${command} ${args.join(" ")} exited with ${code}`))
      else resolve(SUCCESS)
    })
  })
}

async function waitFor(check) {
  const deadline = Date.now() + READY_TIMEOUT_MS
  while (!(await check())) {
    if (Date.now() > deadline) {
      throw new Error("The dev server didn't start in time")
    }
    await new Promise((resolve) => setTimeout(resolve, READY_POLL_MS))
  }
}

async function respondsAt(url) {
  try {
    await fetch(url)
    return true
  } catch {
    return false
  }
}
