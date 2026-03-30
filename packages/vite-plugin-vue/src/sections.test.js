import { describe, expect, it } from "vitest"

import { extractSections } from "./sections.js"

describe("extractSections", () => {
  it("returns template and script sections", () => {
    const code = `
<template>
  <div>Hello</div>
</template>

<script>
const value = 1
</script>
`

    expect(extractSections(code)).toEqual({
      template: "<div>Hello</div>",
      script: "const value = 1",
      scriptLang: "js",
    })
  })

  it("supports TypeScript scripts", () => {
    const code = `
<template><div>Hello</div></template>

<script lang="ts">
const value: number = 1
</script>
`

    expect(extractSections(code)).toEqual({
      template: "<div>Hello</div>",
      script: "const value: number = 1",
      scriptLang: "ts",
    })
  })

  it("returns null values when sections are missing", () => {
    expect(extractSections("<div>Hello</div>")).toEqual({
      template: null,
      script: null,
      scriptLang: null,
    })
  })
})
