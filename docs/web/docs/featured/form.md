---
title: Form Component
description: Form state management with validation, field handling, and submission
---

# Form Component

Declarative form state management with validation, array fields, and submission.

## Basic Setup

```javascript
import { form } from "@inglorious/web/form"

const types = {
  form,
}

const entities = {
  form: {
    type: "form",
    initialValues: {
      email: "",
      password: "",
    },
  },
}
```

## Form State

The form entity tracks:

- `values` — Current field values
- `errors` — Field error messages
- `touched` — Which fields have been touched
- `isPristine` — Whether form has changed
- `isValid` — Whether all validation passes
- `isSubmitting` — Whether submission is in progress

## Field Handling

```javascript
// Update a field value
api.notify("#form:fieldChange", {
  path: "email",
  value: "alice@example.com",
  validate: validateEmail, // Optional
})

// Mark field as touched
api.notify("#form:fieldBlur", {
  path: "email",
  validate: validateEmail,
})

// Reset form
api.notify("#form:reset")
```

## Validation

```javascript
// Sync validation
const validateEmail = (value) => {
  if (!value.includes("@")) return "Invalid email"
  return null
}

// Async validation
const validateUsername = async (value) => {
  const exists = await checkUsername(value)
  if (exists) return "Username taken"
  return null
}

// Form-level validation
const validateForm = (values) => {
  const errors = {}
  if (!values.email) errors.email = "Email required"
  if (!values.password) errors.password = "Password required"
  return errors
}
```

## Array Fields

```javascript
// Add item to array
api.notify("#form:fieldArrayAppend", {
  path: "addresses",
  value: { street: "", city: "" },
})

// Remove item
api.notify("#form:fieldArrayRemove", {
  path: "addresses",
  index: 0,
})

// Move item
api.notify("#form:fieldArrayMove", {
  path: "addresses",
  from: 0,
  to: 1,
})
```

## Rendering

```javascript
import {
  getFieldValue,
  getFieldError,
  isFieldTouched,
} from "@inglorious/web/form"

const loginForm = {
  render(entity, api) {
    return html`
      <form
        @submit=${(e) => {
          e.preventDefault()
          api.notify("#form:validate", { validate: validateForm })
          api.notify("#form:submit")
        }}
      >
        <input
          type="email"
          placeholder="Email"
          .value=${getFieldValue(entity, "email")}
          @input=${(e) =>
            api.notify("#form:fieldChange", {
              path: "email",
              value: e.target.value,
            })}
        />
        ${getFieldError(entity, "email")
          ? html` <p class="error">${getFieldError(entity, "email")}</p> `
          : ""}

        <button type="submit">Login</button>
      </form>
    `
  },
}
```

## Submission

```javascript
const form = {
  // Handle submission
  async submit(entity, payload, api) {
    // Set state BEFORE await
    entity.isSubmitting = true
    entity.submitError = null

    try {
      const result = await sendForm(entity.values)
      // After await, notify success event
      api.notify("#form:submitSuccess", result)
    } catch (error) {
      // After await, notify error event
      api.notify("#form:submitError", error.message)
    }
  },

  // Handle success
  submitSuccess(entity) {
    entity.isSubmitting = false
    entity.submitError = null
    // Clear form or show success message
  },

  // Handle error
  submitError(entity, error) {
    entity.isSubmitting = false
    entity.submitError = error
  },

  render(entity, api) {
    return html`
      <form @submit=${() => api.notify("#form:submit")}>
        <!-- fields -->
        ${entity.submitError
          ? html`<p class="error">${entity.submitError}</p>`
          : ""}
        <button ?disabled=${entity.isSubmitting}>
          ${entity.isSubmitting ? "Loading..." : "Submit"}
        </button>
      </form>
    `
  },
}
```

**[Full Form Documentation](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/packages/web#forms)**
