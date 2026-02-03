---
title: Components Overview
description: Introduction to built-in components and integration options
---

# Components Overview

Inglorious Web comes with several built-in, entity-based components for common UI patterns. Each is fully customizable and testable.

## Philosophy

Unlike framework components that hide internals and force props, Inglorious Web components are **entity types with customizable behavior**.

This means:

- **Transparent** — You can see exactly how they work
- **Customizable** — Override any method or behavior
- **Composable** — Mix with other types through type composition
- **Testable** — Test with simple `trigger()` calls, no special setup

#title: Components Overview
description: Introduction to built-in components and integration options

# Built-in Components

### Router

Client-side routing that integrates directly with your store.

- Hash-based or path-based routing
- URL sync with entity state
- Lazy-loadable routes
- Type composition for route guards (auth, permissions)

**[Learn more →](./router.md)**

### Form

Declarative form state management with validation.

- Field state tracking (value, error, touched)
- Array field support (add/remove/reorder)
- Sync and async validation
- Form-level submission handling

**[Learn more →](./form.md)**

### Table

Flexible table component for displaying data.

- Sortable columns
- Customizable cell rendering
- Row selection
- Themeable with CSS

**[Learn more →](./table.md)**

### Select

Dropdown with single/multi-select, search, and keyboard nav.

- Single and multi-select modes
- Searchable options
- Keyboard navigation (arrow keys, enter, escape)
- Custom option rendering

**[Learn more →](./select.md)**

### Virtual List

Efficient rendering of large lists with virtualization.

- Renders only visible items
- Configurable item height
- Automatic height measurement
- Smooth scrolling with buffering

**[Learn more →](./list.md)**

## Using Built-in Components

### Basic Setup

```javascript
import { createStore, mount, html } from "@inglorious/web"
import { form } from "@inglorious/web/form"
import { table } from "@inglorious/web/table"

const types = {
  form,
  table,
  // ... your types
}

const entities = {
  form: {
    type: "form",
    initialValues: { email: "", password: "" },
  },
  table: {
    type: "table",
    data: [
      /* ... */
    ],
    columns: [
      /* ... */
    ],
  },
}

const store = createStore({ types, entities })

mount(
  store,
  (api) => html` ${api.render("form")} ${api.render("table")} `,
  document.getElementById("root"),
)
```

### Customizing Components

Override any method:

```javascript
import { form } from "@inglorious/web/form"

const customForm = {
  ...form,

  // Override validation
  validate(entity, schema) {
    // Custom validation logic
  },

  // Override submission
  submit(entity, api) {
    // Custom submit logic
  },

  // Override rendering
  render(entity, api) {
    // Custom form layout
  },
}
```

### Composing with Behaviors

Add logging, analytics, or guards:

```javascript
const logging = (type) => ({
  fieldChange(entity, payload, api) {
    console.log("Field changed:", payload)
    type.fieldChange?.(entity, payload, api)
  },
})

const types = {
  form: [form, logging],
}
```

## When to Use Built-in Components

✅ **Use them if:**

- You need that specific functionality (form, table, router, etc.)
- You want store-integrated, predictable behavior
- You want simple, pure-function testing
- You want to avoid external dependencies

❌ **Consider alternatives if:**

- You need complex features (like calendar, date picker)
- You need framework-agnostic components
- You want a design system out of the box

## Integration with Third-Party UI

Inglorious Web plays nicely with:

- **Web Components** — Shoelace, Material Web Components, etc.
- **Design Systems** — Any CSS framework
- **Specialized Libraries** — Date pickers, rich editors, etc.

**[Learn more →](./web-components.md)**

## Advanced Customization

All built-in components use type composition. This means you can:

1. **Extend them** — Add your own event handlers
2. **Compose them** — Mix with guard behaviors
3. **Override them** — Replace any method completely
4. **Test them** — With simple `trigger()` calls

Example: Form with custom validation:

```javascript
const customForm = {
  ...form,

  validate(entity, schema) {
    // Custom validation logic
    const errors = {}

    if (entity.values.email && !entity.values.email.includes("@")) {
      errors.email = "Invalid email"
    }

    return errors
  },
}
```

## Testing Components

Testing is straightforward with `trigger()`:

```javascript
import { form } from "@inglorious/web/form"
import { trigger } from "@inglorious/web/test"

test("form sets field value", () => {
  const { entity } = trigger(
    { type: "form", initialValues: { name: "" }, values: { name: "" } },
    form.fieldChange,
    { path: "name", value: "Alice" },
  )

  expect(entity.values.name).toBe("Alice")
})
```

## Component-Specific Features

Each component has unique features. Dive into the specific docs:

- **[Router](./router.md)** — URL routing with guards
- **[Form](./form.md)** — Validation, array fields, submission
- **[Table](./table.md)** — Sorting, custom rendering
- **[Select](./select.md)** — Multi-select, search, keyboard nav
- **[List](./list.md)** — Virtual scrolling for large datasets

## Next Steps

- Pick a component and read its documentation
- Explore integration options: [JSX](./jsx.md), [Vue Templates](./vue-templates.md), [Web Components](./web-components.md)
- Build something! 🚀
