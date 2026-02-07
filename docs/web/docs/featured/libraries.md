---
title: Building Component Libraries
description: Create, publish, and customize component libraries
---

# Building Component Libraries

Inglorious Web types are uniquely suited for building component libraries because they're fully customizable through JavaScript.

## The Advantage

Unlike React components (restricted by props), Inglorious types can be customized completely:

```javascript
// React: Limited to exposed props
<MyTable columns={cols} data={data} onSort={...} />
// Can't customize rendering beyond what component author exposed

// Inglorious Web: Complete customization
const myTable = {
  ...table,
  render(entity, api) {
    // Override entire rendering
  },
  sortRows(entity, field) {
    // Override sorting logic
  },
}
```

## Publishing a Component Library

### 1. Export Your Types

```javascript
// @mycompany/design-system/components/card.js
export const card = {
  render(entity, api) {
    return html`
      <div class="card">
        <div class="card-header">${entity.title}</div>
        <div class="card-body">${entity.content}</div>
      </div>
    `
  },
}

// @mycompany/design-system/components/button.js
export const button = {
  onClick(entity, handler) {
    handler()
  },

  render(entity, api) {
    return html`
      <button
        class=${"btn btn-" + entity.variant}
        @click=${() => api.notify(`#${entity.id}:onClick`)}
      >
        ${entity.label}
      </button>
    `
  },
}
```

### 2. Export Behaviors

Behaviors are reusable mixins:

```javascript
// @mycompany/design-system/behaviors/sortable.js
export const sortable = (type) => ({
  sortBy(entity, field) {
    entity.sortField = field
    entity.sortDirection = entity.sortDirection === "asc" ? "desc" : "asc"
  },

  render(entity, api) {
    const render = type.render(entity, api)
    // Wrap original render with sort UI
    return html` ${renderSortControls(entity, api)} ${render} `
  },
})

// @mycompany/design-system/behaviors/exportable.js
export const exportable = (type) => ({
  exportData(entity, format) {
    const data = formatData(entity.data, format)
    downloadFile(data, `export.${format}`)
  },

  render(entity, api) {
    const render = type.render(entity, api)
    return html` ${render} ${renderExportButton(entity, api)} `
  },
})
```

### 3. Create Preset Combinations

```javascript
// @mycompany/design-system/presets/basicTable.js
import { table } from "@inglorious/web/table"
import { sortable, exportable } from "./behaviors"

export const basicTable = table

export const sortableTable = [table, sortable]

export const advancedTable = [
  table,
  sortable,
  exportable,
  {
    // Additional custom logic
  },
]
```

## Users Customize Freely

Your library users can customize exactly what they need:

```javascript
import { table, sortable, exportable } from "@mycompany/design-system"

// Use as-is
const simpleTable = { ...table }

// Override specific method
const customTable = {
  ...table,
  render(entity, api) {
    return html`
      <table class="my-custom-style">
        <!-- Custom rendering -->
      </table>
    `
  },
}

// Compose multiple behaviors
const advancedTable = [
  table,
  sortable,
  exportable,
  {
    // Add custom behavior
    onRowClick(entity, rowId) {
      entity.selectedRow = rowId
    },
  },
]

// Mix and match
const customAdvanced = [
  {
    ...table,
    render(entity, api) {
      // Custom render
    },
  },
  sortable,
  {
    // Only export, not sortable
    exportData(entity, format) {
      // Custom export
    },
  },
]
```

## Documentation Example

```markdown
# Card Component

A flexible card component for displaying grouped content.

## Basic Usage

\`\`\`javascript
import { card } from '@mycompany/design-system'

const types = {
card,
}

const entities = {
myCard: {
type: 'card',
title: 'Hello',
content: 'World',
},
}
\`\`\`

## Customization

Override the render method:

\`\`\`javascript
const customCard = {
...card,
render(entity, api) {
return html\`

<div class="my-card">
<header style="background: ${entity.headerColor}">
${entity.title}
        </header>
        <main>${entity.content}</main>
</div>
\`
},
}
\`\`\`

## Composition

Compose with behaviors:

\`\`\`javascript
import { card } from '@mycompany/design-system'
import { draggable, closeable } from '@mycompany/design-system/behaviors'

const types = {
modalCard: [card, draggable, closeable],
}
\`\`\`

## Testing

Test with \`trigger()\`:

\`\`\`javascript
import { card } from '@mycompany/design-system'
import { trigger } from '@inglorious/web/test'

test('card renders title', () => {
const { entity } = trigger(
{ type: 'card', title: 'Test', content: 'Content' },
() => {},
card.render
)
expect(entity.title).toBe('Test')
})
\`\`\`
```

## Benefits for Library Authors

✅ **Users get complete control** without forking  
✅ **No prop interface to maintain** — Just plain JavaScript  
✅ **Composition is clean** — Arrays instead of wrapper hell  
✅ **Testing is trivial** — No special setup needed  
✅ **Documentation is simple** — Just show the code

## Best Practices

1. **Export both components and behaviors**

   ```javascript
   export { card, button, table }
   export { sortable, draggable, closeable }
   ```

2. **Provide presets for common combinations**

   ```javascript
   export { advancedTable, sortableTable }
   ```

3. **Document customization patterns**
   - Show how to override render
   - Show how to add behaviors
   - Provide examples

4. **Keep components flexible**
   - Don't hide internals
   - Allow full customization
   - Avoid excessive logic in render

5. **Version carefully**
   - Changing method signatures breaks user customizations
   - Prefer adding new methods over changing existing ones
   - Document breaking changes clearly

## Examples

The Inglorious ecosystem includes libraries built this way:

- **[@inglorious/web](https://npmjs.com/@inglorious/web)** — Form, Table, Router, etc.
- **[Inglorious Engine](https://npmjs.com/@inglorious/engine)** — Game entity types

Check them out for inspiration!

## Next Steps

- **[Type Composition](../advanced/type-composition.md)** — Master composition patterns
- **[Testing](../advanced/testing.md)** — Ensure your library works correctly

Happy building! 📦
