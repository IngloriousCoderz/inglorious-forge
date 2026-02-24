import "@inglorious/ui/tokens"
import "@inglorious/ui/themes/inglorious"
import "@inglorious/ui/themes/material"
import "@inglorious/ui/themes/bootstrap"
import "@inglorious/ui/button.css"
import "@inglorious/ui/button-group.css"
import "@inglorious/ui/checkbox.css"
import "@inglorious/ui/fab.css"
import "@inglorious/ui/icon-button.css"
import "@inglorious/ui/input.css"
import "@inglorious/ui/radio-group.css"
import "@inglorious/ui/rating.css"
import "@inglorious/ui/select.css"
import "@inglorious/ui/slider.css"
import "@inglorious/ui/switch.css"
import "@inglorious/ui/card.css"
import "@inglorious/ui/flex.css"
import "@inglorious/ui/grid.css"

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
