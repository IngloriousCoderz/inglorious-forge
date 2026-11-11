export const themes = [
  { value: "ios-26", label: "iOS 26" },
  { value: "ios-18", label: "iOS 18" },
  { value: "material-3", label: "Material 3" },
  { value: "material-ui", label: "Material UI" },
  { value: "bootstrap", label: "Bootstrap" },
  { value: "inglorious", label: "Inglorious" },
]

export function themeClasses({ theme, isDark }) {
  const mode = theme === "inglorious" ? !isDark && "light" : isDark && "dark"
  return [`iw-theme-${theme}`, mode && `iw-theme-${mode}`]
    .filter(Boolean)
    .join(" ")
}
