const previousKeysByElement = new WeakMap()

function clearProp(element, key) {
  if (key in element && !key.includes("-")) {
    try {
      element[key] = undefined
    } catch {
      // Ignore read-only property assignments.
    }
  }
  element.removeAttribute(key)
}

function setProp(element, key, value) {
  if (value == null) {
    clearProp(element, key)
    return
  }

  if (typeof value === "boolean") {
    if (value) {
      element.setAttribute(key, "")
    } else {
      element.removeAttribute(key)
    }

    if (key in element && !key.includes("-")) {
      try {
        element[key] = value
      } catch {
        // Ignore read-only property assignments.
      }
    }
    return
  }

  if (key === "style" && typeof value === "object" && value !== null) {
    Object.assign(element.style, value)
    return
  }

  if (key in element && !key.includes("-")) {
    try {
      element[key] = value
      return
    } catch {
      // Fallback to attribute below.
    }
  }

  element.setAttribute(key, String(value))
}

/**
 * Apply arbitrary properties/attributes to an element.
 * Useful when entities include extra DOM fields beyond the typed API.
 *
 * @param {Element | null} element
 * @param {Record<string, unknown>} props
 */
export function applyElementProps(element, props) {
  if (!element) return

  const previousKeys = previousKeysByElement.get(element) ?? new Set()
  const nextKeys = new Set(Object.keys(props))

  for (const key of previousKeys) {
    if (!nextKeys.has(key)) {
      clearProp(element, key)
    }
  }

  for (const [key, value] of Object.entries(props)) {
    if (key === "class" || key === "className") continue
    setProp(element, key, value)
  }

  previousKeysByElement.set(element, nextKeys)
}
