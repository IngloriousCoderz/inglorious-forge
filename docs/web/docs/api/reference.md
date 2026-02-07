---
title: API Reference
description: Complete API documentation for Inglorious Web
---

# API Reference

Complete reference for Inglorious Web's public API.

## createStore(config)

Creates a new store instance.

### Parameters

```typescript
interface StoreConfig {
  types: Record<string, TypeDefinition>
  entities?: Record<string, Entity>
  middlewares?: Middleware[]
  autoCreateEntities?: boolean
}
```

### Returns

```typescript
interface Store {
  entities: Record<string, Entity>
  getEntity(id: string): Entity | undefined
  getEntities(type: string): Entity[]
  render(entity: string | Entity): TemplateResult
  notify(event: string, payload?: any): void
  update(entity: Entity, fn: UpdateFn): void
  subscribe(callback: (store: Store) => void): () => void
}
```

### Example

```javascript
const store = createStore({
  types: {
    counter: {
      increment: (entity) => {
        entity.count++
      },
      render: (entity, api) => html`...`,
    },
  },
  entities: {
    counter: { type: "counter", count: 0 },
  },
})
```

## Type Definition

```typescript
interface TypeDefinition {
  create?(entity: Entity, payload?: any, api?: API): void | Promise<void>
  render?(entity: Entity, api?: API): TemplateResult | null
  destroy?(entity: Entity, api?: API): void
  [eventName: string]: EventHandler | undefined
}

type EventHandler = (
  entity: Entity,
  payload?: any,
  api?: API,
) => void | Promise<void>
```

### Event Naming

```javascript
// Broadcast event (all types)
api.notify("eventName")

// Targeted to type
api.notify("#typeName:eventName")

// Targeted to specific entity
api.notify("#typeName#entityId:eventName")

// Legacy: type#id
api.notify("typeName#entityId:eventName")
```

## API Object

Passed as second argument to handlers and render methods.

### Methods

#### `render(entity)`

Render an entity to HTML. It is just a convenience method that allows to avoid invoking the render method of a type directly:

```javascript
// Rendering the header entity...
api.render("header")

// is the same as:
header.render(api.getEntity("header"), api)
```

#### `getEntity(id)`

Get entity by ID.

```javascript
const user = api.getEntity("user")
```

#### `getEntities()`

Get all entities.

```javascript
const todos = api.getEntities()
```

#### `notify(event, payload)`

Dispatch an event.

```javascript
api.notify("#counter:increment", 5)
api.notify("#form:submit", { email: "user@example.com" })
```

#### `dispatch(action)`

Dispatch an event, Redux-style.

```javascript
api.dispatch({ type: "#counter:increment", payload: 5 })
api.dispatch({ type: "#form:submit", payload: { email: "user@example.com" } })
```

## Directives

Template literals for special handling, borrowed from lit-html.

### `when(condition)`

Conditional rendering.

```javascript
html`
  ${when(entity.isOpen, () => html`<div>Open</div>`)}
  ${when(!entity.isOpen, () => html`<div>Closed</div>`)}
`
```

### `repeat(items, fn)`

List rendering with key-based diffing.

```javascript
html`
  <ul>
    ${repeat(
      entity.todos,
      (item) => item.id,
      (item) => html` <li>${item.title}</li> `,
    )}
  </ul>
`
```

### `unsafeHTML(html)`

Raw HTML (use with caution).

```javascript
html`<div>${unsafeHTML(entity.richText)}</div>`
```

## mount(store, renderFn, container)

Mount the app to the DOM.

### Parameters

- `store` — Store instance
- `renderFn` — Function returning TemplateResult
- `container` — DOM element

### Example

```javascript
mount(store, (api) => api.render("app"), document.getElementById("root"))
```

## Utilities

### `trigger(store, entity, event, payload)`

Dispatch event and wait for completion (testing).

```javascript
await trigger(store, todo, "toggle")
assert.equal(todo.completed, true)
```

### `render(store, entity)`

Render entity to string (testing).

```javascript
const html = await render(store, todoItem)
assert.include(html, "Buy milk")
```

### `compute(fn, inputs)`

Memoize expensive computation.

```javascript
const total = compute(
  () => items.reduce((sum, item) => sum + item.price, 0),
  [items],
)
```

## Middleware

Intercept and modify events.

```typescript
interface Middleware {
  (store: Store, event: Event): Event | null
}

interface Event {
  type: string
  targetType?: string
  targetId?: string
  payload?: any
}
```

### Example

```javascript
const loggingMiddleware = (store, event) => {
  console.log("Event:", event.type, event.payload)
  return event // Always return event
}

const store = createStore({
  types,
  middlewares: [loggingMiddleware],
})
```

## Built-in Components

### Router

```typescript
interface RouterConfig {
  routes: {
    [path: string]: ComponentDef
  }
  notFound?: ComponentDef
}

interface RouterEntity {
  currentPath: string
  params: Record<string, string>
}

// Usage
const router = {
  routes: {
    "/": Home,
    "/about": About,
    "/:id": Detail,
  },
}
```

### Form

```typescript
interface FormConfig {
  initialValues: Record<string, any>
  onSubmit: (values) => void | Promise<void>
  validate?: (values) => Record<string, string>
}

interface FormEntity {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isDirty: boolean
}
```

### Table

```typescript
interface TableConfig {
  data: any[]
  columns: ColumnDef[]
  onRowClick?: (row: any) => void
}

interface ColumnDef {
  key: string
  label: string
  format?: (value: any) => string
}
```

### Select

```typescript
interface SelectConfig {
  options: SelectOption[]
  value?: any | any[]
  multiple?: boolean
  searchable?: boolean
}

interface SelectOption {
  value: any
  label: string
  disabled?: boolean
}
```

### Virtual List

```typescript
interface ListConfig {
  items: any[]
  renderItem: (item: any) => TemplateResult
  itemHeight: number
  bufferSize?: number
}
```

## Environment Variables

### `import.meta.env.DEV`

Is development mode.

```javascript
if (import.meta.env.DEV) {
  console.log("Debug info")
}
```

### `import.meta.env.PROD`

Is production mode.

```javascript
if (import.meta.env.PROD) {
  // Enable analytics
}
```

## TypeScript

### Entity Type

```typescript
interface Entity {
  type: string
  [key: string]: any
}
```

### Template Result

```typescript
type TemplateResult = import("lit-html").TemplateResult
```

### Update Function

```typescript
type UpdateFn<T extends Entity = Entity> = (draft: Draft<T>) => void
```

## Packages

### Core Packages

- **@inglorious/web** — Main package (Web + Store)
- **@inglorious/store** — State management only
- **@inglorious/jsx** — JSX support
- **@inglorious/vite-plugin-jsx** — Vite JSX plugin

### Related Packages

- **@inglorious/engine** — Game framework
- **@inglorious/ssx** — Static site generation
- **@inglorious/vite-plugin-vue** — Vue template support
- **@inglorious/create-app** — Scaffolding tool

## Changelog

See [CHANGELOG.md](https://github.com/ingloriouscode/inglorious-web/blob/main/CHANGELOG.md) for version history and breaking changes.

## Migration Guides

- **React → Inglorious Web** — [View comparison](../comparison.md)

## Related

- **[Guide](../guide/getting-started.md)** — Getting started guide
- **[Featured Types](../featured/overview.md)** — Built-in types documentation
- **[Advanced](../advanced/type-composition.md)** — Advanced patterns

Need help? [Report an issue](https://github.com/ingloriouscode/inglorious-web/issues) or [ask on discussions](https://github.com/ingloriouscode/inglorious-web/discussions).
