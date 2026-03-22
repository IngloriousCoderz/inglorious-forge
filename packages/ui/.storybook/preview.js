import "@fontsource/material-symbols-outlined"
import "@fortawesome/fontawesome-free/css/all.min.css"
import "@inglorious/ui/themes/inglorious.css"
import "@inglorious/ui/themes/material.css"
import "@inglorious/ui/themes/bootstrap.css"
import "@inglorious/ui/all.css"

import { createIcons, Heart, Settings, User } from "lucide"

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

export const initialGlobals = {
  theme: "inglorious",
  mode: "dark",
}

const themeClasses = {
  inglorious: "iw-theme-inglorious",
  material: "iw-theme-material",
  bootstrap: "iw-theme-bootstrap",
}

function applyTheme(theme, mode) {
  const themeClass = themeClasses[theme] || themeClasses.inglorious
  const modeClass = mode === "light" ? "iw-theme-light" : "iw-theme-dark"

  document.body.className = document.body.className
    .replace(/iw-theme-(\\w+)/g, "")
    .trim()
  document.body.className =
    `${document.body.className} ${themeClass} ${modeClass}`.trim()

  const background =
    getComputedStyle(document.body).getPropertyValue("--iw-color-bg").trim() ||
    (mode === "dark" ? "#111827" : "#ffffff")
  const foreground =
    getComputedStyle(document.body)
      .getPropertyValue("--iw-color-text")
      .trim() || (mode === "dark" ? "#f9fafb" : "#111827")

  document.body.style.backgroundColor = background
  document.body.style.color = foreground

  const root = document.getElementById("storybook-root")
  if (root) {
    root.style.backgroundColor = background
    root.style.color = foreground
  }
}

createIcons({
  icons: {
    User,
    Settings,
    Heart,
  },
  attrs: {
    "stroke-width": 1.75,
  },
})

function hydrateLucide() {
  const run = () => {
    createIcons({
      icons: {
        User,
        Settings,
        Heart,
      },
      attrs: {
        "stroke-width": 1.75,
      },
    })
  }

  // MDX docs can mount content after the initial story return.
  queueMicrotask(run)
  requestAnimationFrame(run)
  setTimeout(run, 0)
  setTimeout(run, 80)
}

export const decorators = [
  (story, context) => {
    applyTheme(context.globals.theme, context.globals.mode)

    const result = story()
    hydrateLucide()

    return result
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
