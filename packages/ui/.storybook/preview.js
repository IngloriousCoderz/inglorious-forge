import "@inglorious/ui/themes/inglorious.css"
import "@inglorious/ui/themes/material-ui.css"
import "@inglorious/ui/themes/material-3.css"
import "@inglorious/ui/themes/bootstrap.css"
import "@inglorious/ui/themes/ios-18.css"
import "@inglorious/ui/themes/ios-26.css"
import "@inglorious/ui/all.css"

export default {
  tags: ["autodocs"],
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
        { value: "material-ui", title: "Material UI" },
        { value: "material-3", title: "Material 3" },
        { value: "bootstrap", title: "Bootstrap" },
        { value: "ios-18", title: "iOS 18" },
        { value: "ios-26", title: "iOS 26" },
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

export const initialGlobals = {
  theme: "inglorious",
  mode: "dark",
}

const themeClasses = {
  inglorious: "iw-theme-inglorious",
  "material-ui": "iw-theme-material-ui",
  "material-3": "iw-theme-material-3",
  bootstrap: "iw-theme-bootstrap",
  "ios-18": "iw-theme-ios-18",
  "ios-26": "iw-theme-ios-26",
}

export const decorators = [
  (story, context) => {
    applyTheme(context.globals.theme, context.globals.mode)

    return story()
  },
]

export const parameters = {
  options: {
    storySort: {
      order: ["Overview"],
    },
  },
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

function applyTheme(theme, mode) {
  const themeClass = themeClasses[theme] || themeClasses.inglorious
  const modeClass = mode === "light" ? "iw-theme-light" : "iw-theme-dark"

  // Only one theme and one mode at a time: the previous ones go first, or
  // their rules would still apply wherever the new theme sets nothing.
  const { classList } = document.body
  const previous = [...classList].filter((name) => name.startsWith("iw-theme-"))
  classList.remove(...previous)
  classList.add(themeClass, modeClass)

  // The theme paints the body itself; colors a story left inline, as the
  // dashboard's theme switcher does, would outlast the switch.
  document.body.style.removeProperty("background-color")
  document.body.style.removeProperty("color")
  document.documentElement.style.removeProperty("color-scheme")
}
