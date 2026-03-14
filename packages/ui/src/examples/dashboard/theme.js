const DEFAULT_THEME = "inglorious"
const DEFAULT_MODE = "dark"

export const theme = {
  create(entity) {
    entity.theme ??= DEFAULT_THEME
    entity.mode ??= DEFAULT_MODE
    applyTheme(entity.theme, entity.mode)
  },

  set(entity, payload = {}) {
    const nextTheme = payload.theme ?? entity.theme ?? DEFAULT_THEME
    const nextMode = payload.mode ?? entity.mode ?? DEFAULT_MODE

    entity.theme = nextTheme
    entity.mode = nextMode
    applyTheme(nextTheme, nextMode)
  },

  toggle(entity) {
    const currentMode = entity.mode ?? getThemeMode()
    const nextMode = currentMode === "dark" ? "light" : "dark"

    entity.theme ??= DEFAULT_THEME
    entity.mode = nextMode
    applyTheme(entity.theme, nextMode)
  },
}

function applyTheme(theme = DEFAULT_THEME, mode = DEFAULT_MODE) {
  if (typeof document === "undefined") return

  const themeClass = `iw-theme-${theme}`
  const modeClass = mode === "light" ? "iw-theme-light" : "iw-theme-dark"

  document.body.className = document.body.className.replace(
    /iw-theme-(\w+)/g,
    "",
  )
  document.body.classList.add(themeClass, modeClass)
  document.body.dataset.iwThemeMode = mode
  document.body.dataset.iwTheme = theme
  document.documentElement.style.colorScheme = mode

  const background =
    getComputedStyle(document.body).getPropertyValue("--iw-color-bg").trim() ||
    (mode === "dark" ? "#111827" : "#ffffff")
  const foreground =
    getComputedStyle(document.body)
      .getPropertyValue("--iw-color-text")
      .trim() || (mode === "dark" ? "#f9fafb" : "#111827")

  document.body.style.backgroundColor = background
  document.body.style.color = foreground
}

function getThemeMode() {
  if (typeof document === "undefined") return DEFAULT_MODE
  return document.body?.dataset?.iwThemeMode || DEFAULT_MODE
}
