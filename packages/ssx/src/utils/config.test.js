import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"

import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { loadConfig } from "./config.js"

describe("loadConfig", () => {
  let rootDir

  beforeEach(() => {
    // Inside the package: Vitest's module loader only imports files under
    // the project root.
    rootDir = mkdtempSync(path.join(import.meta.dirname, ".tmp-config-"))
    mkdirSync(path.join(rootDir, "src"))
  })

  afterEach(() => {
    rmSync(rootDir, { recursive: true, force: true })
  })

  function writeSource(file, code) {
    writeFileSync(path.join(rootDir, "src", file), code)
  }

  it("loads a JavaScript config from src", async () => {
    writeSource("site.config.js", `export default { title: "JS" }`)

    await expect(loadConfig({ rootDir })).resolves.toEqual({ title: "JS" })
  })

  it("loads a TypeScript config, and the TypeScript it imports", async () => {
    writeSource("title.ts", `export const title: string = "TS"`)
    writeSource(
      "site.config.ts",
      `import type { SiteConfig } from "@inglorious/ssx"
      import { title } from "./title"

      const config: SiteConfig = { title }
      export default config`,
    )

    await expect(
      loadConfig({ rootDir, configPath: "site.config.ts" }),
    ).resolves.toEqual({ title: "TS" })
  })

  it("falls back to the defaults without a config file", async () => {
    await expect(loadConfig({ rootDir })).resolves.toEqual({})
  })

  it("reports an error inside the config instead of ignoring it", async () => {
    writeSource("site.config.js", `import "./missing.js"\nexport default {}`)

    await expect(loadConfig({ rootDir })).rejects.toThrow()
  })
})
