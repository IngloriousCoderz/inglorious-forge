import { describe, expect, it } from "vitest"

import { vue } from "../src/index.js"

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

    it("generates correct component name from filename", async () => {
      const code = `<template><div>Test</div></template>`
      const result = await transform(code, "my-component.vue")
      expect(result).toContain("export const myComponent")
    })

    it("converts kebab-case to camelCase", async () => {
      const code = `<template><div>Test</div></template>`
      const result = await transform(code, "user-profile.vue")
      expect(result).toContain("export const userProfile")
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

    it("adds entity prefix to interpolations", async () => {
      const code = `
<template>
  <p>{{ count }}</p>
</template>
`
      const result = await transform(code)
      expect(result).toContain("${entity.count}")
    })

    it("handles multiple interpolations", async () => {
      const code = `
<template>
  <p>{{ x }} + {{ y }} = {{ x + y }}</p>
</template>
`
      const result = await transform(code)
      expect(result).toContain("${entity.x}")
      expect(result).toContain("${entity.y}")
      expect(result).toMatchSnapshot()
    })

    it("does not double-wrap entity prefix", async () => {
      const code = `
<template>
  <p>{{ entity.value }}</p>
</template>
`
      const result = await transform(code)
      expect(result).toContain("${entity.value}")
      expect(result).not.toContain("entity.entity.")
    })

    it("handles whitespace in interpolations", async () => {
      const code = `
<template>
  <div>{{   spaced   }}</div>
</template>
`
      const result = await transform(code)
      expect(result).toContain("${entity.spaced}")
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

    it("uses property binding for camelCase attributes", async () => {
      const code = `
<template>
  <input :maxLength="10" />
</template>
`
      const result = await transform(code)
      expect(result).toContain(".maxLength")
    })

    it("uses attribute binding for class and id", async () => {
      const code = `
<template>
  <div :class="className" :id="divId"></div>
</template>
`
      const result = await transform(code)
      expect(result).toContain('class="${entity.className}"')
      expect(result).toContain('id="${entity.divId}"')
      // Should not use property binding syntax
      expect(result).not.toMatch(/\.class\s*=/)
      expect(result).not.toMatch(/\.id\s*=/)
    })

    it("uses attribute binding for kebab-case", async () => {
      const code = `
<template>
  <div :data-test="testValue"></div>
</template>
`
      const result = await transform(code)
      expect(result).toContain('data-test="${entity.testValue}"')
      expect(result).not.toContain(".data-test")
    })

    it("supports v-bind: syntax", async () => {
      const code = `
<template>
  <input v-bind:value="text" />
</template>
`
      const result = await transform(code)
      expect(result).toContain(".value")
    })

    it("supports v-on: syntax", async () => {
      const code = `
<template>
  <button v-on:click="handleClick">Click</button>
</template>

<script>
const handleClick = (entity) => {}
</script>
`
      const result = await transform(code)
      expect(result).toContain("@click")
    })

    it("preserves static attributes", async () => {
      const code = `
<template>
  <input type="text" placeholder="Enter name" class="input" />
</template>
`
      const result = await transform(code)
      expect(result).toContain('type="text"')
      expect(result).toContain('placeholder="Enter name"')
      expect(result).toContain('class="input"')
    })
  })

  describe("event handlers", () => {
    it("transforms method references to api.notify", async () => {
      const code = `
<template>
  <button @click="increment">+</button>
</template>

<script>
const increment = (entity) => entity.count++
</script>
`
      const result = await transform(code)
      expect(result).toContain("api.notify")
      expect(result).toContain(":increment")
      expect(result).toMatchSnapshot()
    })

    it("passes through inline arrow functions", async () => {
      const code = `
<template>
  <button @click="(e) => handleClick(entity, e)">Click</button>
</template>
`
      const result = await transform(code)
      expect(result).toContain("(e) => handleClick(entity, e)")
      expect(result).not.toContain("api.notify")
    })

    it("handles multiple event types", async () => {
      const code = `
<template>
  <input
    @input="onInput"
    @blur="onBlur"
    @focus="onFocus"
  />
</template>

<script>
const onInput = (entity) => {}
const onBlur = (entity) => {}
const onFocus = (entity) => {}
</script>
`
      const result = await transform(code)
      expect(result).toContain("@input")
      expect(result).toContain("@blur")
      expect(result).toContain("@focus")
      expect(result).toMatchSnapshot()
    })

    it("distinguishes between methods and inline handlers", async () => {
      const code = `
<template>
  <div>
    <button @click="simpleMethod">Simple</button>
    <button @click="() => methodWithCall(entity)">Method call</button>
    <button @click="(e) => console.log(e)">Non-method inline</button>
  </div>
</template>

<script>
const simpleMethod = (entity) => {}
const methodWithCall = (entity) => {}
</script>
`
      const result = await transform(code)
      // Simple method should use api.notify
      expect(result).toContain("api.notify")
      expect(result).toContain(":simpleMethod")
      // Inline method call should also use api.notify
      expect(result).toContain(":methodWithCall")
      expect(result).toMatch(/api\.notify.*methodWithCall/s)
      // Non-method inline handler should pass through
      expect(result).toContain("(e) => console.log(e)")
    })

    it("transforms inline method calls with arguments to api.notify", async () => {
      const code = `
<template>
  <button @click="() => deleteItem(entity, item.id)">Delete</button>
</template>

<script>
const deleteItem = (entity, id) => {
  console.log('Deleting', id)
}
</script>
`
      const result = await transform(code)
      expect(result).toContain("api.notify")
      expect(result).toContain(":deleteItem")
      expect(result).toContain("item.id")
      // Should transform to: api.notify(`#${entity.id}:deleteItem`, item.id)
      expect(result).toMatch(/api\.notify\([^,]+:deleteItem[^,]+,\s*item\.id\)/)
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

    it("handles v-if / v-else-if / v-else", async () => {
      const code = `
<template>
  <div v-if="status === 'loading'">Loading</div>
  <div v-else-if="status === 'error'">Error</div>
  <div v-else>Success</div>
</template>
`
      const result = await transform(code)
      expect(result).toContain("when")
      expect(result).toMatchSnapshot()
    })

    it("handles nested v-if", async () => {
      const code = `
<template>
  <div v-if="outer">
    <span v-if="inner">Nested</span>
  </div>
</template>
`
      const result = await transform(code)
      expect(result).toMatchSnapshot()
    })

    it("adds entity prefix to v-if conditions", async () => {
      const code = `
<template>
  <div v-if="isVisible">Content</div>
</template>
`
      const result = await transform(code)
      expect(result).toContain("entity.isVisible")
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

    it("handles v-for with index", async () => {
      const code = `
<template>
  <li v-for="(item, index) in items" :key="item.id">
    {{ index }}: {{ item.name }}
  </li>
</template>
`
      const result = await transform(code)
      expect(result).toContain("(item, index)")
      expect(result).toMatchSnapshot()
    })

    it("adds entity prefix to v-for collection", async () => {
      const code = `
<template>
  <li v-for="item in todos" :key="item.id">
    {{ item.text }}
  </li>
</template>
`
      const result = await transform(code)
      expect(result).toContain("entity.todos")
    })

    it("does not add entity prefix to loop variable", async () => {
      const code = `
<template>
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>
</template>
`
      const result = await transform(code)
      expect(result).toContain("${item.name}")
      expect(result).not.toContain("${entity.item.name}")
    })

    it("handles v-for without :key", async () => {
      const code = `
<template>
  <li v-for="item in items">
    {{ item.name }}
  </li>
</template>
`
      const result = await transform(code)
      expect(result).toContain("repeat")
      expect(result).toMatchSnapshot()
    })
  })

  describe("script section", () => {
    it("includes script content verbatim", async () => {
      const code = `
<template>
  <div @click="increment">{{ value }}</div>
</template>

<script>
const value = 0
const increment = (entity) => entity.value++
</script>
`
      const result = await transform(code)
      expect(result).toMatchSnapshot()
    })

    it("separates state variables from methods", async () => {
      const code = `
<template>
  <div>{{ count }}</div>
</template>

<script>
const count = 0
const items = []
const increment = (entity) => entity.count++
const addItem = (entity, item) => entity.items.push(item)
</script>
`
      const result = await transform(code)
      expect(result).toContain("create(entity)")
      expect(result).toContain("entity.count = 0")
      expect(result).toContain("entity.items = []")
      expect(result).toContain("increment(entity)")
      expect(result).toContain("addItem(entity")
      expect(result).toMatchSnapshot()
    })

    it("handles arrow function methods", async () => {
      const code = `
<template>
  <div @click="increment">{{ count }}</div>
</template>

<script>
const count = 0
const increment = (entity) => entity.count++
</script>
`
      const result = await transform(code)
      expect(result).toContain("increment(entity) {")
      expect(result).toContain("entity.count++")
      expect(result).toMatchSnapshot()
    })

    it("handles regular function declarations", async () => {
      const code = `
<template>
  <div @click="increment">{{ count }}</div>
</template>

<script>
const count = 0
function increment(entity) {
  entity.count++
}
</script>
`
      const result = await transform(code)
      expect(result).toContain("increment(entity)")
      expect(result).toMatchSnapshot()
    })

    it("handles multi-line function bodies", async () => {
      const code = `
<template>
  <button @click="save">Save</button>
</template>

<script>
const save = (entity) => {
  const data = entity.formData
  console.log('Saving', data)
  entity.saved = true
}
</script>
`
      const result = await transform(code)
      expect(result).toContain("save(entity) {")
      expect(result).toMatchSnapshot()
    })

    it("works without script section", async () => {
      const code = `
<template>
  <div>Static content</div>
</template>
`
      const result = await transform(code)
      expect(result).toContain("render(entity, api)")
      expect(result).not.toContain("create(entity)")
      expect(result).toMatchSnapshot()
    })
  })

  describe("imports", () => {
    it("imports only html by default", async () => {
      const code = `
<template>
  <div>Hello</div>
</template>
`
      const result = await transform(code)
      expect(result).toContain('import { html } from "@inglorious/web"')
      expect(result).not.toContain(", when")
      expect(result).not.toContain(", repeat")
    })

    it("imports when for v-if", async () => {
      const code = `
<template>
  <div v-if="show">Content</div>
</template>
`
      const result = await transform(code)
      expect(result).toContain("html, when")
    })

    it("imports repeat for v-for", async () => {
      const code = `
<template>
  <li v-for="item in items" :key="item.id">{{ item }}</li>
</template>
`
      const result = await transform(code)
      expect(result).toContain("html, repeat")
    })

    it("imports all needed directives", async () => {
      const code = `
<template>
  <ul v-if="items.length">
    <li v-for="item in items" :key="item.id">{{ item }}</li>
  </ul>
</template>
`
      const result = await transform(code)
      expect(result).toContain("html")
      expect(result).toContain("repeat")
      expect(result).toContain("when")
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

    it("handles complete todo app", async () => {
      const code = `
<template>
  <div class="todos">
    <form @submit="addTodo">
      <input :value="newTodo" @input="updateNewTodo" />
      <button type="submit">Add</button>
    </form>
    <ul v-if="todos.length > 0">
      <li v-for="todo in todos" :key="todo.id">
        <input type="checkbox" :checked="todo.done" @change="() => toggleTodo(entity, todo.id)" />
        <span>{{ todo.text }}</span>
        <button @click="() => removeTodo(entity, todo.id)">×</button>
      </li>
    </ul>
    <p v-else>No todos yet!</p>
  </div>
</template>

<script>
const todos = []
const newTodo = ''

const addTodo = (entity, e) => {
  e.preventDefault()
  if (!entity.newTodo.trim()) return
  entity.todos.push({
    id: Date.now(),
    text: entity.newTodo,
    done: false
  })
  entity.newTodo = ''
}

const updateNewTodo = (entity, e) => {
  entity.newTodo = e.target.value
}

const toggleTodo = (entity, id) => {
  const todo = entity.todos.find(t => t.id === id)
  if (todo) todo.done = !todo.done
}

const removeTodo = (entity, id) => {
  entity.todos = entity.todos.filter(t => t.id !== id)
}
</script>
`
      const result = await transform(code)
      expect(result).toMatchSnapshot()
    })
  })

  describe("TypeScript support", () => {
    it("handles TypeScript script sections", async () => {
      const code = `
<template>
  <div>{{ message }}</div>
</template>

<script lang="ts">
const message: string = "Hello"
const greet = (entity: any): void => {
  console.log(entity.message)
}
</script>
`
      const result = await transform(code)
      expect(result).toBeDefined()
      expect(result).toMatchSnapshot()
    })

    it("handles lang='typescript'", async () => {
      const code = `
<template>
  <div>Test</div>
</template>

<script lang="typescript">
const count: number = 0
</script>
`
      const result = await transform(code)
      expect(result).toBeDefined()
      expect(result).toContain("entity.count = 0")
    })
  })

  describe("edge cases", () => {
    it("handles empty template", async () => {
      const code = `<template></template>`
      const result = await transform(code)
      expect(result).toContain("render(entity, api)")
      expect(result).toBeTruthy()
    })

    it("handles self-closing tags", async () => {
      const code = `
<template>
  <div>
    <input type="text" />
    <br />
  </div>
</template>
`
      const result = await transform(code)
      expect(result).toMatchSnapshot()
    })
  })

  describe("component references", () => {
    it("renders PascalCase component without props", async () => {
      const code = `
<template>
  <Message1 />
</template>
`
      const result = await transform(code)
      expect(result).toMatchSnapshot()
    })

    it("renders multiple PascalCase components", async () => {
      const code = `
<template>
  <div>
    <Header />
    <Message1 />
    <Footer />
  </div>
</template>
`
      const result = await transform(code)
      expect(result).toMatchSnapshot()
    })

    it("renders nested PascalCase components", async () => {
      const code = `
<template>
  <Section>
    <Message1 />
  </Section>
</template>
`
      const result = await transform(code)
      expect(result).toMatchSnapshot()
    })

    it("renders PascalCase component inside conditionals", async () => {
      const code = `
<template>
  <Message1 v-if="visible" />
</template>
`
      const result = await transform(code)
      expect(result).toMatchSnapshot()
    })

    it("renders PascalCase component inside loops", async () => {
      const code = `
<template>
  <Message1 v-for="item in items" />
</template>
`
      const result = await transform(code)
      expect(result).toMatchSnapshot()
    })
  })
})
