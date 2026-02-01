import { describe, expect, it } from "vitest"

import { vue } from "."

describe("@inglorious/vite-plugin-vue", () => {
  const plugin = vue()

  async function transform(code, id = "test-component.vue") {
    const result = await plugin.transform(code, id)
    return result ? result.code : null
  }

  describe("basic behavior", () => {
    it("skips non-vue files", async () => {
      const result = await plugin.transform("const x = 1", "test.js")
      expect(result).toBeNull()
    })

    it("throws if no template tag is present", async () => {
      await expect(transform("<script>const x = 1</script>")).rejects.toThrow(
        "No <template> tag found",
      )
    })

    it("transforms a simple template", async () => {
      const code = `
<template>
  <div>Hello World</div>
</template>
`
      const result = await transform(code)
      expect(result).toMatchSnapshot()
    })
  })

  describe("interpolations", () => {
    it("handles interpolation", async () => {
      const code = `
<template>
  <p>Hello {{ name }}!</p>
</template>
`
      const result = await transform(code)
      expect(result).toMatchSnapshot()
    })
  })

  describe("bindings", () => {
    it("handles property and event bindings", async () => {
      const code = `
<template>
  <input
    type="text"
    :value="text"
    :maxLength="maxLength"
    @input="onInput"
  />
</template>
`
      const result = await transform(code)
      expect(result).toMatchSnapshot()
    })
  })

  describe("conditionals", () => {
    it("handles v-if / v-else", async () => {
      const code = `
<template>
  <div v-if="show">Yes</div>
  <div v-else>No</div>
</template>
`
      const result = await transform(code)
      expect(result).toMatchSnapshot()
    })
  })

  describe("loops", () => {
    it("handles v-for", async () => {
      const code = `
<template>
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>
</template>
`
      const result = await transform(code)
      expect(result).toMatchSnapshot()
    })
  })

  describe("script section", () => {
    it("includes script content verbatim", async () => {
      const code = `
<template>
  <div @click="increment">{{ entity.value }}</div>
</template>

<script>
const value = 0
const increment = (entity) => entity.value++
</script>
`
      const result = await transform(code)
      expect(result).toMatchSnapshot()
    })
  })

  describe("complex component", () => {
    it("handles a realistic component", async () => {
      const code = `
<template>
  <div>
    <ul v-if="todos.length">
      <li v-for="todo in todos" :key="todo.id">
        {{ todo.text }}
      </li>
    </ul>
    <p v-else>No todos</p>
  </div>
</template>

<script>
const todos = []
</script>
`
      const result = await transform(code)
      expect(result).toMatchSnapshot()
    })
  })
})
