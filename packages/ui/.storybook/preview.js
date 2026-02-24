import "@inglorious/ui/tokens"
import "@inglorious/ui/themes/inglorious"
import "@inglorious/ui/themes/material"
import "@inglorious/ui/themes/bootstrap"
import "@inglorious/ui/button.css"
import "@inglorious/ui/input.css"
import "@inglorious/ui/card.css"

export default {
  tags: ["autodocs"],
}

export const parameters = {
  actions: {
    argTypesRegex: "^on[A-Z].*",
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/i,
    },
  },
  backgrounds: {
    disabled: true,
  },
}

export const globalTypes = {
  theme: {
    name: "Theme",
    description: "Global theme for components",
    defaultValue: "inglorious",
    toolbar: {
      icon: "paintbrush",
      items: [
        { value: "inglorious", title: "Inglorious" },
        { value: "material", title: "Material" },
        { value: "bootstrap", title: "Bootstrap" },
      ],
    },
  },
  mode: {
    name: "Mode",
    description: "Light or dark mode",
    defaultValue: "dark",
    toolbar: {
      icon: "mirror",
      items: [
        { value: "dark", title: "Dark" },
        { value: "light", title: "Light" },
      ],
    },
  },
}

const themeClasses = {
  inglorious: "iw-theme-inglorious",
  material: "iw-theme-material",
  bootstrap: "iw-theme-bootstrap",
}

export const decorators = [
  (story, context) => {
    const theme = context.globals.theme
    const mode = context.globals.mode
    const themeClass = themeClasses[theme] || themeClasses.inglorious
    const modeClass = mode === "light" ? "iw-theme-light" : "iw-theme-dark"

    document.body.className = `${themeClass} ${modeClass}`.trim()

    return story()
  },
]
