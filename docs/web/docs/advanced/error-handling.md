---
title: Error Handling
description: Error handling patterns, validation, and error boundaries
---

# Error Handling

Inglorious Web provides several patterns for handling errors gracefully.

## Rendering Errors

Since the full template tree re-renders on state change, an error in any entity's `render` method could crash the entire app.

**Best practice:** Wrap render in try-catch:

```javascript
const myType = {
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

## Event Handler Errors

Event handlers can fail. Handle them gracefully:

```javascript
const myType = {
  saveData(entity, data) {
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
const dataLoader = {
  async fetchData(entity, api) {
    entity.isLoading = true
    entity.error = null

    try {
      const response = await fetch("/api/data")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      // After await, notify success event
      api.notify("#dataLoader:fetchSuccess", data)
    } catch (error) {
      // After await, notify error event
      api.notify("#dataLoader:fetchError", error.message)
    }
  },

  fetchSuccess(entity, data) {
    entity.isLoading = false
    entity.data = data
    entity.error = null
  },

  fetchError(entity, error) {
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
          <button @click=${() => api.notify("#dataLoader:fetchData")}>
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
const user = {
  setEmail(entity, email) {
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
          @input=${(e) => api.notify("#user:setEmail", e.target.value)}
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

const form = {
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

## Error Boundaries with Composition

Create an error boundary behavior:

```javascript
const errorBoundary = (type) => ({
  // Wrap all handlers with try-catch
  [Symbol.hasInstance](entity, payload, api) {
    // This doesn't work exactly as-is, but here's the concept
    try {
      const handler = type[this.name]
      if (handler) {
        return handler(entity, payload, api)
      }
    } catch (error) {
      entity.error = error.message
      console.error(error)
    }
  },
})
```

Better approach: wrap in handlers:

```javascript
const types = {
  protectedPage: {
    navigate(entity, route) {
      try {
        // Navigation logic
        entity.route = route
      } catch (error) {
        entity.error = `Navigation failed: ${error.message}`
      }
    },
  },
}
```

## Global Error Handling

Add a global error entity:

```javascript
const errorNotification = {
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
const myType = {
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
