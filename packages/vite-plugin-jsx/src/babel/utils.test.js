import { describe, expect, it } from "vitest"

import { createImportSpecifier, isJsx, toCamelCase, tpl } from "./utils.js"

describe("babel utils", () => {
  it("creates template elements", () => {
    expect(tpl("abc")).toEqual({
      type: "TemplateElement",
      value: { raw: "abc", cooked: "abc" },
      tail: false,
    })
  })

  it("creates import specifiers", () => {
    expect(createImportSpecifier("html")).toEqual({
      type: "ImportSpecifier",
      imported: { type: "Identifier", name: "html" },
      local: { type: "Identifier", name: "html" },
    })
  })

  it("converts kebab-case and PascalCase to camelCase", () => {
    expect(toCamelCase("my-element")).toBe("myElement")
    expect(toCamelCase("MyElement")).toBe("myElement")
  })

  it("recognizes JSX and transformed html calls", () => {
    expect(isJsx({ type: "JSXElement" })).toBe(true)
    expect(isJsx({ type: "JSXFragment" })).toBe(true)
    expect(
      isJsx({
        type: "CallExpression",
        callee: { name: "html" },
      }),
    ).toBe(true)
    expect(isJsx({ type: "Identifier", name: "noop" })).toBe(false)
  })
})
