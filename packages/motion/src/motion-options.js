const DEFAULT_LAYOUT_DURATION_MS = 260
const DEFAULT_LAYOUT_EASING = "cubic-bezier(0.22, 1, 0.36, 1)"
const DEFAULT_PRESENCE_GROUP_KEY = "motionPresenceGroup"

/**
 * Resolves the optional layout config into a normalized object.
 *
 * @param {boolean | { duration?: number, easing?: string } | undefined} layout
 * @returns {{ duration: number, easing: string } | null}
 */
export function resolveLayoutOptions(layout) {
  if (!layout) {
    return null
  }

  if (layout === true) {
    return {
      duration: DEFAULT_LAYOUT_DURATION_MS,
      easing: DEFAULT_LAYOUT_EASING,
    }
  }

  return {
    duration: layout.duration ?? DEFAULT_LAYOUT_DURATION_MS,
    easing: layout.easing ?? DEFAULT_LAYOUT_EASING,
  }
}

/**
 * Resolves presence configuration into explicit values.
 *
 * @param {{ mode?: "sync" | "wait", groupKey?: string } | undefined} presence
 * @returns {{ mode: "sync" | "wait", groupKey: string }}
 */
export function resolvePresenceOptions(presence) {
  if (!presence) {
    return {
      groupKey: DEFAULT_PRESENCE_GROUP_KEY,
      mode: "sync",
    }
  }

  return {
    groupKey: presence.groupKey ?? DEFAULT_PRESENCE_GROUP_KEY,
    mode: presence.mode ?? "sync",
  }
}

/**
 * Reads a layout id from an entity using the configured key.
 *
 * @param {object} entity
 * @param {string | undefined} layoutIdKey
 * @returns {string | null}
 */
export function getLayoutId(entity, layoutIdKey) {
  if (!layoutIdKey) {
    return null
  }

  return entity[layoutIdKey] ?? null
}

/**
 * Reads the presence group id from an entity.
 *
 * @param {object} entity
 * @param {string | undefined} groupKey
 * @returns {string | null}
 */
export function getPresenceGroup(entity, groupKey) {
  if (!groupKey) {
    return null
  }

  return entity[groupKey] ?? null
}
