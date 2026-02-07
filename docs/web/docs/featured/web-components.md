---
title: Web Components Integration
description: Use third-party Web Components and libraries like Shoelace and Material Web
---

# Web Components Integration

Inglorious Web works seamlessly with Web Component libraries and design systems.

## Why Integrate Web Components?

Web Components are useful for:

- **Complex UI** — Date pickers, rich editors, advanced data viz
- **Third-party Libraries** — Shoelace, Material Web Components, Lion
- **Specialized Functionality** — Things Inglorious doesn't provide
- **Cross-framework Sharing** — Components work anywhere

## Using Web Components

### Basic Example: Shoelace Color Picker

```bash
npm install @shoelace-style/shoelace
```

```javascript
import "@shoelace-style/shoelace/dist/components/color-picker/color-picker.js"

const themeEditor = {
  colorChange(entity, color) {
    entity.primaryColor = color
  },

  render(entity, api) {
    return html`
      <div>
        <label>Primary Color</label>
        <sl-color-picker
          value=${entity.primaryColor}
          @sl-change=${(e) =>
            api.notify("#themeEditor:colorChange", e.target.value)}
        ></sl-color-picker>
      </div>
    `
  },
}
```

### With Attributes

```javascript
render(entity, api) {
  return html`
    <sl-select
      label="Choose an option"
      ?disabled=${entity.isDisabled}
      @sl-change=${(e) => api.notify('#select:changed', e.target.value)}
    >
      ${entity.options.map(opt => html`
        <sl-option value=${opt.id}>${opt.name}</sl-option>
      `)}
    </sl-select>
  `
}
```

## Hybrid Approach

Use Inglorious Web components for core patterns, Web Components for specialized UI:

```javascript
import { form } from "@inglorious/web/form"
import { table } from "@inglorious/web/table"
import "@shoelace-style/shoelace/dist/components/date-picker/date-picker.js"

const types = {
  // Inglorious form for business logic
  form: {
    ...form,
    render(entity, api) {
      return html`
        <form>
          <!-- Inglorious form fields -->
          ${api.render("emailField")}

          <!-- Web Component for date pick -->
          <label>Birth Date</label>
          <sl-date-picker
            @sl-change=${(e) =>
              api.notify("#form:fieldChange", {
                path: "birthDate",
                value: e.target.value,
              })}
          ></sl-date-picker>
        </form>
      `
    },
  },

  // Inglorious table for data display
  dataTable: {
    ...table,
    // Customize as needed
  },
}
```

## SSR/SSG Limitations

⚠️ **Important for @inglorious/ssx projects:**

Most Web Component libraries (Shoelace, Material Web Components) require JavaScript to initialize and don't pre-render to HTML. This means:

- Won't appear in pre-rendered HTML
- Not SEO-friendly in initial state
- May cause FOUC (Flash of Unstyled Content)
- Should be client-only enhancements

**Recommendation:** Use Inglorious Web components for SSX/SSG projects.

## Popular Libraries

### Shoelace

Rich, accessible component library. Great for design systems.

```bash
npm install @shoelace-style/shoelace
```

### Material Web Components

Google's Material Design components.

```bash
npm install @material/web
```

### Lion

Open-source, accessible Web Components.

```bash
npm install @lion/button @lion/form
```

## Best Practices

✅ **Do:**

- Use Inglorious for core business logic
- Use Web Components for specialized UI
- Integrate through events (api.notify)
- Keep store state primary (not component internal state)
- Test Web Component integration through store events

❌ **Don't:**

- Store state inside Web Components
- Bypass Inglorious event system
- Rely on Web Components for critical business logic
- Use Web Components for simple patterns (buttons, inputs, etc.)

## Debugging

If Web Components aren't updating correctly:

1. **Check event handling** — Make sure you're dispatching the right events
2. **Property vs Attribute** — Use `.property` for properties, not attributes
3. **Timing** — Web Component may initialize after first render
4. **Ref binding** — Use `ref()` directive if you need direct access

```javascript
import { ref } from "lit-html"

const picker = {
  render(entity, api) {
    const colorRef = ref()

    return html`
      <sl-color-picker
        ${colorRef}
        @sl-change=${(e) => {
          // Direct access via ref if needed
          console.log(colorRef.value.value)
        }}
      ></sl-color-picker>
    `
  },
}
```

## Related

- **[Components Overview](./overview.md)** — Inglorious Web's built-in components
- **[Advanced](../advanced/type-composition.md)** — Type composition and other patterns

Happy integrating! 🎉
