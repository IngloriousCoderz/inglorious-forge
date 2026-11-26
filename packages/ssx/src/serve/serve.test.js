/**
 * @vitest-environment node
 */
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import net from "node:net"
import { tmpdir } from "node:os"
import path from "node:path"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { serve } from "./index.js"

describe("serve", () => {
  let outDir
  let server

  beforeEach(async () => {
    vi.spyOn(console, "log").mockImplementation(() => {})
    outDir = await mkdtemp(path.join(tmpdir(), "ssx-serve-"))
    await writeFile(path.join(outDir, "index.html"), "<h1>Home</h1>")
  })

  afterEach(async () => {
    server?.close()
    await rm(outDir, { recursive: true, force: true })
    vi.restoreAllMocks()
  })

  it("listens on the port it is given", async () => {
    const port = await freePort()

    server = await serve({ rootDir: outDir, outDir, port })

    const response = await fetch(`http://localhost:${port}/`)
    expect(await response.text()).toBe("<h1>Home</h1>")
  })

  it("falls back to the config's vite.server.port", async () => {
    const port = await freePort()

    server = await serve({
      rootDir: outDir,
      outDir,
      vite: { server: { port } },
    })

    const response = await fetch(`http://localhost:${port}/`)
    expect(response.ok).toBe(true)
  })

  it("prefers the given port over the config's", async () => {
    const port = await freePort()
    const configPort = await freePort()

    server = await serve({
      rootDir: outDir,
      outDir,
      port,
      vite: { server: { port: configPort } },
    })

    const response = await fetch(`http://localhost:${port}/`)
    expect(response.ok).toBe(true)
  })
})

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer()
    probe.unref()
    probe.on("error", reject)
    probe.listen(0, () => {
      const { port } = probe.address()
      probe.close(() => resolve(port))
    })
  })
}
