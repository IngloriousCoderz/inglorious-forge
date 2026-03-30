import { describe, expect, it } from "vitest"

import { parseTemplate, transformTemplate, wrapWithEntity } from "./template.js"

describe("template helpers", () => {
  it("parses templates into DOM nodes", () => {
    const dom = parseTemplate("<div>Hello</div>")
    expect(dom).toHaveLength(1)
    expect(dom[0].name).toBe("div")
  })

  it("wraps bare expressions with entity", () => {
    expect(wrapWithEntity("count", {})).toBe("entity.count")
    expect(wrapWithEntity("entity.count", {})).toBe("entity.count")
    expect(wrapWithEntity("helper(count)", {}, new Set(["helper"]))).toBe(
      "helper(count)",
    )
  })

  it("renders a simple template", () => {
    const dom = parseTemplate("<div>Hello {{ name }}</div>")
    const result = transformTemplate(dom)

    expect(result.imports.has("html")).toBe(true)
    expect(result.code).toContain("${entity.name}")
  })

  it("renders v-if and v-for directives", () => {
    const dom = parseTemplate(`
<ul v-if="items.length">
  <li v-for="item in items" :key="item.id">{{ item.name }}</li>
</ul>
`)

    const result = transformTemplate(dom, [], new Set())
    expect(result.imports.has("when")).toBe(true)
    expect(result.imports.has("repeat")).toBe(true)
    expect(result.code).toContain("repeat")
    expect(result.code).toContain("when")
  })

  it("renders PascalCase components and preserves props", () => {
    const dom = parseTemplate(`<StatCard :value="count" label="Total" />`)
    const result = transformTemplate(dom)

    expect(result.code).toContain("api.render")
    expect(result.code).toContain("value: entity.count")
    expect(result.code).toContain('label: "Total"')
  })

  it("forwards v-bind objects directly to component renders", () => {
    const dom = parseTemplate(`<StatCard v-bind="card" />`)
    const result = transformTemplate(dom)

    expect(result.code).toContain('api.render("statCard", entity.card)')
  })
})
