const DEFAULT_THEME = "inglorious"
const DEFAULT_MODE = "auto"
const THEME_CYCLE = ["inglorious", "material", "bootstrap"]
const MODE_CYCLE = ["auto", "light", "dark"]

let currentTheme = DEFAULT_THEME
let currentMode = DEFAULT_MODE
let systemMedia
let systemListener

export function applyTheme(theme = currentTheme, mode = currentMode) {
  if (typeof document === "undefined") return

  currentTheme = theme ?? DEFAULT_THEME
  currentMode = mode ?? DEFAULT_MODE
  ensureSystemListener()

  const resolvedMode = resolveMode(currentMode)
  const themeClass = `iw-theme-${currentTheme}`
  const modeClass =
    resolvedMode === "light" ? "iw-theme-light" : "iw-theme-dark"

  document.body.className = document.body.className.replace(
    /iw-theme-(\w+)/g,
    "",
  )
  document.body.classList.add(themeClass, modeClass)
  document.body.dataset.iwThemeMode = currentMode
  document.body.dataset.iwTheme = currentTheme
  document.documentElement.style.colorScheme = resolvedMode

  const background =
    getComputedStyle(document.body).getPropertyValue("--iw-color-bg").trim() ||
    (resolvedMode === "dark" ? "#111827" : "#ffffff")
  const foreground =
    getComputedStyle(document.body)
      .getPropertyValue("--iw-color-text")
      .trim() || (resolvedMode === "dark" ? "#f9fafb" : "#111827")

  document.body.style.backgroundColor = background
  document.body.style.color = foreground
}

export function getTheme() {
  return currentTheme
}

export function getMode() {
  return currentMode
}

export function nextTheme(theme) {
  const index = THEME_CYCLE.indexOf(theme)
  if (index === -1) return THEME_CYCLE[0]
  return THEME_CYCLE[(index + 1) % THEME_CYCLE.length]
}

export function nextMode(mode) {
  const index = MODE_CYCLE.indexOf(mode)
  if (index === -1) return MODE_CYCLE[0]
  return MODE_CYCLE[(index + 1) % MODE_CYCLE.length]
}

function resolveMode(mode) {
  if (mode !== "auto") return mode
  return getSystemMode()
}

function getSystemMode() {
  if (typeof window === "undefined") return "light"
  systemMedia ??= window.matchMedia("(prefers-color-scheme: dark)")
  return systemMedia.matches ? "dark" : "light"
}

function ensureSystemListener() {
  if (typeof window === "undefined") return
  systemMedia ??= window.matchMedia("(prefers-color-scheme: dark)")
  if (systemListener) return

  systemListener = () => {
    if (currentMode !== "auto") return
    applyTheme(currentTheme, currentMode)
  }

  if (typeof systemMedia.addEventListener === "function") {
    systemMedia.addEventListener("change", systemListener)
  } else if (typeof systemMedia.addListener === "function") {
    systemMedia.addListener(systemListener)
  }
}

export const DEFAULTS = {
  theme: DEFAULT_THEME,
  mode: DEFAULT_MODE,
}
