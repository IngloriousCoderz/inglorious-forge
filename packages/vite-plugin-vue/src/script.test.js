import { parse } from "@babel/parser"
import { describe, expect, it } from "vitest"

import {
  extractFunctionBody,
  extractParams,
  extractValue,
  parseScript,
} from "./script.js"

describe("script helpers", () => {
  it("extracts parameters from functions", () => {
    expect(extractParams({ params: [] })).toBe("entity")
    expect(
      extractParams({ params: [{ type: "Identifier", name: "value" }] }),
    ).toBe("value")
    expect(
      extractParams({
        params: [
          {
            type: "RestElement",
            argument: { type: "Identifier", name: "values" },
          },
        ],
      }),
    ).toBe("...values")
  })

  it("extracts values from source slices", () => {
    expect(extractValue(null, "const value = 1")).toBe("undefined")
    expect(extractValue({ start: 14, end: 15 }, "const value = 1")).toBe("1")
  })

  it("parses state variables, methods, and imports", () => {
    const script = `
import { helper } from "./helper.js"

const value = 1
const increment = (entity) => entity.value++

function reset(entity) {
  entity.value = 0
}
`

    const result = parseScript(script, "js")

    expect(result.stateVars).toEqual([{ name: "value", value: "1" }])
    expect(result.methods).toHaveLength(2)
    expect(result.scriptImports.has("helper")).toBe(true)
    expect(result.importDecls).toHaveLength(1)
  })

  it("generates TypeScript-safe function bodies", () => {
    const result = parseScript(
      `
const increment = (entity: { value: number }) => {
  entity.value++
}
`,
      "ts",
    )

    expect(result.methods).toHaveLength(1)
    expect(result.methods[0].body).toContain("entity.value++")
  })

  it("extracts a body from source text", () => {
    const source = `
const increment = (entity) => {
  entity.value++
}
`
    const ast = parse(source, { sourceType: "module" })
    const init = ast.program.body[0].declarations[0].init

    expect(extractFunctionBody(init, source)).toContain("entity.value++")
  })
})
