import {
  applyTheme,
  DEFAULTS,
  getMode,
  getTheme,
  nextTheme,
} from "./theme-utils.js"

export const theme = {
  create(entity) {
    entity.theme ??= DEFAULTS.theme
    applyTheme(entity.theme, getMode())
  },

  set(entity, payload = {}) {
    const next = payload.theme ?? entity.theme ?? DEFAULTS.theme
    entity.theme = next
    applyTheme(next, getMode())
  },

  toggle(entity) {
    const activeTheme = entity.theme ?? getTheme()
    const next = nextTheme(activeTheme)
    entity.theme = next
    applyTheme(next, getMode())
  },
}
