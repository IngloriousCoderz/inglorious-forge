---
title: Framework Comparison
description: Inglorious Web vs React, Vue, Solid, Svelte, Next.js, and Astro
---

# Comparison with Other Frameworks

How Inglorious Web stacks up against popular alternatives, and when each is the better choice. The performance figures come from [honest benchmarks](https://dev.to/iceonfire/you-probably-dont-need-to-think-about-ui-optimization-honest-benchmarks-2m5g) run on the same apps in every framework, with the code public so anyone can check them.

## In Short

Inglorious Web is not the fastest framework: Solid is. It sits in the same "fast enough" tier as Vue and Svelte, and full-tree rendering costs about 4 ms per update even in a deliberately adversarial benchmark. Its case is somewhere else:

- **State is the hard part of most apps, and it handles it best.** All state lives in one store of entities and changes only through named events. State machines (`fsm()`) and async requests (`handleRequest`) are built in, so an answer that arrives after the user has moved on, or after a newer request, is dropped instead of corrupting the screen. Saving the app is saving its entities.
- **Testing needs no rendering.** A handler is a function of the entity and the event: `trigger(entity, Counter.add, 2)` runs it and returns the result, with no DOM, no `act()` and no runtime.
- **One coherent stack.** Store, web, a component library with a data grid and charts, SSX for static and server rendering, and `create-app` with routing, i18n, PWA and Capacitor, all following one convention, with skills that teach coding agents to follow it too.

Something else is the better choice when:

- You need components Inglorious UI does not have yet, such as a rich-text editor, maps or a date picker.
- The app must be maintained by a team that cannot take on a framework with a small community.
- Updates are sustained, rapid and sparse on weak devices, where Solid's fine-grained updates win, or the site is mostly content, where Astro ships almost no JavaScript.
- The mobile app must be truly native: Inglorious apps reach Android and iOS through Capacitor, which wraps the web app.

## vs React

| Feature         | React                         | Inglorious Web                          |
| --------------- | ----------------------------- | --------------------------------------- |
| **Concept**     | Component-based               | Entity-based                            |
| **Rendering**   | Virtual DOM                   | Full-tree re-render, diffed by lit-html |
| **State**       | Component state + a library   | One store of entities                   |
| **Async state** | Effects, or a library         | `handleRequest`, in the store           |
| **Bundle**      | 62–79 kB (same dashboard app) | ~16 kB (same dashboard app)             |
| **Performance** | Fast enough                   | Fast enough: same tier                  |
| **Testing**     | Render, `act()`, the runtime  | `trigger` on a handler, no rendering    |
| **TypeScript**  | ✅ Excellent                  | ✅ Typed entities, payloads and events  |
| **SSR/SSG**     | ✅ Yes (Next.js)              | ✅ Yes (SSX)                            |
| **Mobile**      | React Native (native UI)      | Capacitor (the web app, packaged)       |
| **Ecosystem**   | Huge                          | Small, but batteries included           |

### Example: Counter

**React:**

```jsx
function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}
```

**Inglorious Web:**

```javascript
const Counter = {
  create(entity) {
    entity.count = 0
  },

  increment(entity) {
    entity.count++
  },

  render(entity, api) {
    return html`
      <div>
        <p>${entity.count}</p>
        <button @click=${() => api.notify(`#${entity.id}:increment`)}>+</button>
      </div>
    `
  },
}
```

The count lives in the store, so any other entity, a test or the Redux DevTools can see it, and `increment` is tested without rendering.

### When to Choose

**Choose React if:**

- You need a third-party component Inglorious UI does not have yet
- You need React Native for a truly native mobile UI
- Your team knows React and must maintain the app without outside help

**Choose Inglorious Web if:**

- State is the hard part: multi-step flows, async requests, realtime or collaborative features
- You want handlers tested without rendering
- You want one stack, from the store to the components, instead of assembling one

You can also keep React and adopt the store first: `@inglorious/react-store` gives React components `useEntity` and `useNotify`.

## vs Vue

| Feature        | Vue                       | Inglorious Web                         |
| -------------- | ------------------------- | -------------------------------------- |
| **Concept**    | Component-based           | Entity-based                           |
| **Rendering**  | Virtual DOM + signals     | Full-tree re-render                    |
| **State**      | Refs, or Pinia            | One store of entities                  |
| **Bundle**     | 27–29 kB (same dashboard) | ~16 kB (same dashboard)                |
| **Templates**  | Vue templates             | lit-html, JSX or Vue-style templates   |
| **Testing**    | Mount + assertions        | `trigger` + assertions                 |
| **DevTools**   | Vue DevTools              | Redux DevTools                         |
| **TypeScript** | ✅ Excellent              | ✅ Typed entities, payloads and events |
| **SSR/SSG**    | ✅ Yes (Nuxt)             | ✅ Yes (SSX)                           |

### Example: Form

**Vue:**

```vue
<script setup>
import { ref } from "vue"

const email = ref("")
const error = ref(null)

function submit() {
  error.value = email.value.includes("@") ? null : "Invalid email"
}
</script>

<template>
  <form @submit.prevent="submit">
    <input v-model="email" />
    <span v-if="error">{{ error }}</span>
    <button type="submit">Submit</button>
  </form>
</template>
```

**Inglorious Web:**

```javascript
const SignupForm = {
  emailChange(entity, email) {
    entity.email = email
  },

  submit(entity) {
    entity.error = entity.email.includes("@") ? null : "Invalid email"
  },

  render(entity, api) {
    return html`
      <form
        @submit=${(event) => {
          event.preventDefault()
          api.notify(`#${entity.id}:submit`)
        }}
      >
        <input
          .value=${entity.email}
          @input=${(event) =>
            api.notify(`#${entity.id}:emailChange`, event.target.value)}
        />
        ${when(entity.error, () => html`<span>${entity.error}</span>`)}
        <button type="submit">Submit</button>
      </form>
    `
  },
}
```

Every change goes through an event, so `emailChange` and `submit` are tested on their own, and the DevTools show each keystroke. For real forms, `@inglorious/web/form` handles fields, validation and touched state.

### When to Choose

**Choose Vue if:**

- You like signals and single-file components
- You need its larger ecosystem of components and plugins
- Your team already knows it

**Choose Inglorious Web if:**

- You want every state change explicit and replayable
- You want handlers tested without mounting
- You prefer plain JavaScript objects to components with their own state (Vue-style templates are available through `@inglorious/vite-plugin-vue`)

## vs Solid

| Feature         | Solid                     | Inglorious Web          |
| --------------- | ------------------------- | ----------------------- |
| **Concept**     | Signal-based              | Entity-based            |
| **Reactivity**  | Fine-grained              | Full-tree               |
| **Bundle**      | 18–23 kB (same dashboard) | ~16 kB (same dashboard) |
| **Performance** | The fastest measured      | Fast enough             |
| **Memory**      | The lowest measured       | Higher under heavy load |
| **JSX**         | Required (compiled)       | Optional                |
| **Testing**     | Moderate                  | `trigger`, no rendering |

### Example: List

**Solid:**

```jsx
const [todos, setTodos] = createSignal([])

return (
  <ul>
    <For each={todos()}>{(todo) => <li>{todo.title}</li>}</For>
  </ul>
)
```

**Inglorious Web:**

```javascript
render(entity, api) {
  return html`
    <ul>
      ${repeat(entity.todos, (todo) => todo.id, (todo) => html`<li>${todo.title}</li>`)}
    </ul>
  `
}
```

### When to Choose

**Choose Solid if:**

- Updates are sustained, rapid and sparse, such as live dashboards on weak devices
- Long chains of derived values must update without recomputing the rest
- You want the smallest memory footprint

**Choose Inglorious Web if:**

- Performance in the same tier as Vue and Svelte is enough, which it is for most apps
- You prefer one store and explicit events to signals spread across components
- Testing state without rendering matters more than the last millisecond

## vs Svelte

| Feature        | Svelte                    | Inglorious Web                  |
| -------------- | ------------------------- | ------------------------------- |
| **Concept**    | Compiled components       | Entity-based                    |
| **Syntax**     | Svelte's own              | JavaScript + lit-html           |
| **Bundle**     | 14–16 kB (same dashboard) | ~16 kB (same dashboard)         |
| **Compiler**   | Required                  | None (JSX and Vue are optional) |
| **Reactivity** | Runes (signals)           | Full-tree                       |
| **Scoped CSS** | ✅ Built in               | ✅ CSS modules, through Vite    |
| **Testing**    | Mount + assertions        | `trigger`, no rendering         |

### Example: Toggle

**Svelte:**

```svelte
<script>
  let isOpen = $state(false)
</script>

<button onclick={() => (isOpen = !isOpen)}>
  {isOpen ? "Close" : "Open"}
</button>
```

**Inglorious Web:**

```javascript
const Toggle = {
  toggle(entity) {
    entity.isOpen = !entity.isOpen
  },

  render(entity, api) {
    return html`
      <button @click=${() => api.notify(`#${entity.id}:toggle`)}>
        ${entity.isOpen ? "Close" : "Open"}
      </button>
    `
  },
}
```

### When to Choose

**Choose Svelte if:**

- You like a compiler writing the reactivity for you
- You prefer Svelte's syntax and single-file components
- State mostly lives inside components

**Choose Inglorious Web if:**

- You prefer plain JavaScript, with no compile step to learn
- State is shared across the app, and you want it in one place
- You want handlers tested without rendering

## vs Next.js

| Feature         | Next.js                | Inglorious Web + SSX                         |
| --------------- | ---------------------- | -------------------------------------------- |
| **Type**        | Meta-framework         | Framework + SSX                              |
| **Base**        | React                  | Inglorious Web                               |
| **Routing**     | File-based             | File-based                                   |
| **SSR/SSG**     | ✅ Yes                 | ✅ Yes                                       |
| **Scaffolding** | `create-next-app`      | `create-app`: routing, i18n, PWA, Capacitor… |
| **Deploy**      | Vercel, or a Node host | A Vite build: any static or Node host        |
| **Ecosystem**   | Huge                   | Small                                        |
| **Testing**     | Render + mocks         | `trigger`, no rendering                      |

### When to Choose

**Choose Next.js if:**

- You build with React and want its server components
- You rely on its ecosystem and hosting integrations

**Choose Inglorious Web + SSX if:**

- You want static and server rendering without React
- You want one scaffold for web, PWA and mobile apps
- You want the same store and tests on the server and in the browser

## vs Astro

| Feature           | Astro                 | Inglorious Web + SSX |
| ----------------- | --------------------- | -------------------- |
| **Type**          | Meta-framework        | Framework + SSX      |
| **JS by default** | None (islands)        | The app's own        |
| **Islands**       | ✅ Yes                | ❌ No                |
| **Components**    | React, Vue, Svelte, … | Inglorious only      |
| **File routing**  | ✅ Yes                | ✅ Yes               |

### When to Choose

**Choose Astro if:**

- The site is mostly content, with a little interactivity
- Shipping as little JavaScript as possible is the priority
- You want to mix components from several frameworks

**Choose Inglorious Web + SSX if:**

- The site is an app, with state across pages
- You want one framework and one way of testing

## Comparison Table

All frameworks side by side. Bundle sizes are for the same dashboard app in each framework.

| Metric             | Inglorious Web      | React            | Vue         | Svelte          | Solid     |
| ------------------ | ------------------- | ---------------- | ----------- | --------------- | --------- |
| Bundle             | ~16 kB              | 62–79 kB         | 27–29 kB    | 14–16 kB        | 18–23 kB  |
| Performance        | Fast enough         | Fast enough      | Fast enough | Fast enough     | Fastest   |
| Reactivity         | Full-tree render    | Virtual DOM      | Signals     | Runes (signals) | Signals   |
| State management   | Built in (entities) | Your choice      | Your choice | Built in        | Built in  |
| Async and FSMs     | Built in            | Libraries        | Libraries   | Libraries       | Libraries |
| Testing state      | No rendering        | Render + `act()` | Mount       | Mount           | Mount     |
| Batteries included | Yes                 | No               | No          | Partly          | No        |
| Job market         | Tiny                | Huge             | Large       | Medium          | Small     |

## Philosophy Comparison

**React:** "Learn once, write anywhere": components are reusable, and state management is yours to choose.

**Vue:** "Progressive enhancement": adopt complexity as you need it.

**Solid:** "Fine-grained reactivity": maximize performance through signal tracking.

**Svelte:** "Write less code": the compiler handles the boilerplate.

**Inglorious Web:** "State first, no magic": the whole app is entities and events in one store, rendered as a whole, so every change is explicit, replayable and testable without a browser.

## Migration Paths

### From React

- Move component state and context into entities
- Replace `setState` and dispatches with `api.notify()`
- Replace effects that fetch data with `handleRequest`
- Or keep React and start with `@inglorious/react-store`

### From Vue

- Change templates to lit-html, or keep Vue-style templates with `@inglorious/vite-plugin-vue`
- Replace emitted events with `api.notify()`
- Move refs and Pinia stores into entities

### From Solid

- Replace signals with entity fields
- Replace effects with event handlers
- Keep one store instead of many signals

## Choose Inglorious Web If You Want

✅ **Explicit state** — Every change is a named event, visible in the DevTools

✅ **State machines and async, built in** — `fsm()` and `handleRequest` in the store

✅ **Fast testing** — Trigger an event and assert the entity, no rendering

✅ **A small bundle** — About 16 kB for the same app that takes React 62 kB or more

✅ **One stack** — Store, components, charts, SSR and scaffolding that work alike

✅ **Type composition** — Extend behaviors without inheritance

✅ **Agent-ready** — Skills that teach coding agents the conventions

## Next Steps

- **[Getting Started](./guide/getting-started.md)** — Try Inglorious Web
- **[What Is Inglorious Web?](./guide/what-is.md)** — The design philosophy
- **[Honest Benchmarks](https://dev.to/iceonfire/you-probably-dont-need-to-think-about-ui-optimization-honest-benchmarks-2m5g)** — How it performs, and where it does not win
- **[Examples](https://github.com/ingloriousCoderz/inglorious-forge/tree/main/examples)** — See real apps

Still deciding? Build the same small app in two of them and see which you would rather maintain.
