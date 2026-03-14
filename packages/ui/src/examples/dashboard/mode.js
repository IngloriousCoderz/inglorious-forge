import {
  applyTheme,
  DEFAULTS,
  getMode,
  getTheme,
  nextMode,
} from "./theme-utils.js"

export const mode = {
  create(entity) {
    entity.mode ??= DEFAULTS.mode
    applyTheme(getTheme(), entity.mode)
  },

  set(entity, payload = {}) {
    const next = payload.mode ?? entity.mode ?? DEFAULTS.mode
    entity.mode = next
    applyTheme(getTheme(), next)
  },

  toggle(entity) {
    const activeMode = entity.mode ?? getMode()
    const next = nextMode(activeMode)
    entity.mode = next
    applyTheme(getTheme(), next)
  },
}
