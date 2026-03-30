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
    expect(wrapWithEntity("api.getEntity('router')", {})).toBe(
      "api.getEntity('router')",
    )
  })

  it("keeps render-scope locals bare", () => {
    expect(
      wrapWithEntity(
        "dashboardClassName",
        {},
        new Set(),
        new Set(["dashboardClassName"]),
      ),
    ).toBe("dashboardClassName")
    expect(
      wrapWithEntity(
        "isDashboardRoot",
        {},
        new Set(),
        new Set(["isDashboardRoot"]),
      ),
    ).toBe("isDashboardRoot")
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

  it("passes inner content as children for PascalCase components", () => {
    const dom = parseTemplate(`<Flex><span>{{ label }}</span></Flex>`)
    const result = transformTemplate(dom, [], new Set(["Flex"]))

    expect(result.code).toContain("Flex.render({")
    expect(result.code).toContain("children:")
    expect(result.code).toContain("entity.label")
  })

  it("lazily registers imported PascalCase components without props", () => {
    const dom = parseTemplate(`<StatCard />`)
    const result = transformTemplate(dom, [], new Set(["StatCard"]))

    expect(result.code).toContain(
      'api.render("statCard", "StatCard", StatCard)',
    )
  })

  it("forwards v-bind objects directly to component renders", () => {
    const dom = parseTemplate(`<StatCard v-bind="card" />`)
    const result = transformTemplate(dom)

    expect(result.code).toContain('api.render("statCard", entity.card)')
  })

  it("preserves render-scope locals in bindings and conditionals", () => {
    const dom = parseTemplate(`
<Flex :class="dashboardClassName" v-if="isDashboardRoot">
  <span>{{ dashboardClassName }}</span>
</Flex>
`)
    const result = transformTemplate(
      dom,
      [],
      new Set(["Flex"]),
      new Set(["dashboardClassName", "isDashboardRoot"]),
    )

    expect(result.code).toContain("dashboardClassName")
    expect(result.code).toContain("isDashboardRoot")
    expect(result.code).not.toContain("entity.dashboardClassName")
    expect(result.code).not.toContain("entity.isDashboardRoot")
  })
})
