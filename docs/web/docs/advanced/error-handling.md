---
title: Error Handling
description: Error handling patterns, validation, and error boundaries
---

# Error Handling

Inglorious Web provides several patterns for handling errors gracefully.

## Rendering Errors

Since the full template tree re-renders on state change, an error in any entity's `render` method could crash the entire app.

**Best practice:** isolate the render with the [`withErrorBoundary`](./decorators.md#witherrorboundary) decorator, which catches the throw and shows a fallback while the rest of the app keeps rendering:

```javascript
import { html } from "@inglorious/web"
import { withErrorBoundary } from "@inglorious/web/decorators/with-error-boundary"

const types = {
  Chart: [
    ChartBase,
    withErrorBoundary(
      (err) => html`<div class="error">Chart failed: ${err.message}</div>`,
    ),
  ],
}
```

For a one-off you can also wrap the render body in try-catch directly:

```javascript
const MyType = {
  render(entity, api) {
    try {
      // Your render logic
      return html`
        <div>
          <h1>${entity.title}</h1>
          <p>${entity.description}</p>
        </div>
      `
    } catch (error) {
      console.error("Render error:", error)
      return html`<div class="error">Failed to render</div>`
    }
  },
}
```

The decorator is preferred: it keeps the concern out of your render logic and composes onto any type. See [Error Boundaries](#error-boundaries) below for the full picture.

## Event Handler Errors

Event handlers can fail. Handle them gracefully:

```javascript
const MyType = {
  dataSave(entity, data) {
    try {
      // Validate data
      if (!data || !data.id) {
        throw new Error("Invalid data")
      }

      entity.data = data
      entity.error = null
    } catch (error) {
      // Store error on entity for display
      entity.error = error.message
      entity.data = null
    }
  },

  render(entity, api) {
    if (entity.error) {
      return html`<p class="error">${entity.error}</p>`
    }

    return html`<p>${entity.data.id}</p>`
  },
}
```

## Async Operation Errors

Async handlers need error handling:

```javascript
const DataLoader = {
  async dataFetch(entity, api) {
    entity.isLoading = true
    entity.error = null

    try {
      const response = await fetch("/api/data")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      // After await, notify success event
      api.notify("#dataLoader:dataFetchSuccess", data)
    } catch (error) {
      // After await, notify error event
      api.notify("#dataLoader:dataFetchError", error.message)
    }
  },

  dataFetchSuccess(entity, data) {
    entity.isLoading = false
    entity.data = data
    entity.error = null
  },

  dataFetchError(entity, error) {
    entity.isLoading = false
    entity.error = error
    entity.data = null
  },

  render(entity, api) {
    if (entity.isLoading) {
      return html`<p>Loading...</p>`
    }

    if (entity.error) {
      return html`
        <div class="error">
          <p>${entity.error}</p>
          <button @click=${() => api.notify("#dataLoader:dataFetch")}>
            Retry
          </button>
        </div>
      `
    }

    return html`<pre>${JSON.stringify(entity.data, null, 2)}</pre>`
  },
}
```

## Validation Errors

Prevent invalid state with validation:

```javascript
const User = {
  emailChange(entity, email) {
    if (!email || !email.includes("@")) {
      entity.emailError = "Invalid email format"
      return
    }

    entity.email = email
    entity.emailError = null
  },

  render(entity, api) {
    return html`
      <div>
        <input
          type="email"
          value="${entity.email}"
          @input=${(e) => api.notify("#user:emailChange", e.target.value)}
        />
        ${entity.emailError
          ? html`<p class="error">${entity.emailError}</p>`
          : ""}
      </div>
    `
  },
}
```

## Form Validation

Use form validation patterns:

```javascript
const validateEmail = (value) => {
  if (!value) return "Email required"
  if (!value.includes("@")) return "Invalid email format"
  return null
}

const validatePassword = (value) => {
  if (!value) return "Password required"
  if (value.length < 8) return "Password must be 8+ characters"
  return null
}

const Form = {
  fieldChange(entity, { field, value }) {
    entity.values[field] = value

    // Validate
    const validator = {
      email: validateEmail,
      password: validatePassword,
    }[field]

    if (validator) {
      const error = validator(value)
      entity.errors[field] = error
    }
  },

  render(entity, api) {
    return html`
      <form>
        <input
          type="email"
          placeholder="Email"
          value="${entity.values.email}"
          @input=${(e) =>
            api.notify("#form:fieldChange", {
              field: "email",
              value: e.target.value,
            })}
        />
        ${entity.errors.email
          ? html` <p class="error">${entity.errors.email}</p> `
          : ""}
      </form>
    `
  },
}
```

## Error Boundaries

Inglorious Web ships two complementary error boundaries. Together they mean a single throwing render can never white-screen the whole app.

### Entity-level: `withErrorBoundary`

Compose the [`withErrorBoundary`](./decorators.md#witherrorboundary) decorator onto any type to isolate its render. A failing entity shows its fallback while its siblings keep rendering:

```javascript
import { html } from "@inglorious/web"
import { withErrorBoundary } from "@inglorious/web/decorators/with-error-boundary"

const types = {
  Widget: [
    WidgetBase,
    withErrorBoundary(
      (error, entity) =>
        html`<div class="error">${entity.title} failed: ${error.message}</div>`,
    ),
  ],
}
```

Because it wraps `render` deterministically, it produces the same fallback on the server and the client, so it is safe under SSR/[SSX](./ssx.md) with no hydration mismatch.

### Root-level: the `mount` guard

The root render function itself can also throw — before any entity is reached (for example, a missing router entity). `mount` accepts a fourth options argument with `onError` and `fallback` to catch that case, keeping the store subscription alive so one bad update can't freeze the UI:

```javascript
import { html, mount } from "@inglorious/web"

mount(
  store,
  (api) => api.render(api.getEntity("router").route),
  document.getElementById("root"),
  {
    onError: (error, api) => reportToService(error),
    fallback: (error) => html`
      <main class="app-error">
        <h1>Something went wrong</h1>
        <button @click=${() => location.reload()}>Reload</button>
      </main>
    `,
  },
)
```

- `onError(error, api)` — called when the root render throws. Defaults to `console.error`.
- `fallback(error, api)` — optional template rendered in place of the failed root render. If omitted, the error is logged and the last good DOM is left in place.

Use the entity-level decorator for per-widget isolation, and the root guard as a final safety net around the whole app.

## Global Error Handling

Add a global error entity:

```javascript
const ErrorNotification = {
  handleError(entity, error) {
    entity.message = error.message
    entity.type = error.type || "error"

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      entity.message = null
    }, 5000)
  },

  render(entity, api) {
    if (!entity.message) return html``

    return html`
      <div class="${"alert alert-" + entity.type}">
        ${entity.message}
        <button @click=${() => (entity.message = null)}>×</button>
      </div>
    `
  },
}

// In your handlers, notify the error entity
const MyType = {
  async riskyOperation(entity, api) {
    try {
      // Do something risky
    } catch (error) {
      api.notify("#errorNotification:handleError", {
        message: error.message,
        type: "error",
      })
    }
  },
}
```

## Testing Error Cases

```javascript
import { trigger } from "@inglorious/web/test"

test("handles invalid email", () => {
  const { entity } = trigger(
    { email: "", emailError: null },
    user.setEmail,
    "invalid",
  )

  expect(entity.emailError).toBe("Invalid email format")
  expect(entity.email).toBe("")
})

test("async handler stores error on failure", async () => {
  const { entity } = await trigger(
    { data: null, error: null, isLoading: false },
    dataLoader.fetchData,
  )

  // Mock fetch to reject
  global.fetch = jest.fn(() => Promise.reject(new Error("Network error")))

  expect(entity.error).toBe("Network error")
})
```

## Best Practices

✅ **Do:**

- Wrap renders in try-catch
- Store errors on entity
- Validate input in handlers
- Handle async errors with try-catch-finally
- Provide user-friendly error messages
- Add retry mechanisms
- Log errors for debugging

❌ **Don't:**

- Let errors crash the app
- Store error state outside the entity
- Show technical errors to users
- Silently ignore errors
- Rely on global error handlers only

## Next Steps

- **[Performance](./performance.md)** — Optimize your error handling
- **[Testing](./testing.md)** — Test error cases

Happy error handling! 🛟
