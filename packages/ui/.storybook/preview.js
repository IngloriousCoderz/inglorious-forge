import "@fontsource/material-symbols-outlined"
import "@fortawesome/fontawesome-free/css/all.min.css"
import "@inglorious/ui/tokens"
import "@inglorious/ui/themes/inglorious"
import "@inglorious/ui/themes/material"
import "@inglorious/ui/themes/bootstrap"
import "@inglorious/ui/combobox.css"
import "@inglorious/ui/data-grid.css"
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
import "@inglorious/ui/accordion.css"
import "@inglorious/ui/app-bar.css"
import "@inglorious/ui/avatar.css"
import "@inglorious/ui/badge.css"
import "@inglorious/ui/chip.css"
import "@inglorious/ui/divider.css"
import "@inglorious/ui/icon.css"
import "@inglorious/ui/list.css"
import "@inglorious/ui/material-icon.css"
import "@inglorious/ui/paper.css"
import "@inglorious/ui/table.css"
import "@inglorious/ui/tooltip.css"
import "@inglorious/ui/typography.css"
import "@inglorious/ui/alert.css"
import "@inglorious/ui/backdrop.css"
import "@inglorious/ui/dialog.css"
import "@inglorious/ui/progress.css"
import "@inglorious/ui/skeleton.css"
import "@inglorious/ui/snackbar.css"
import "@inglorious/ui/container.css"
import "@inglorious/ui/bottom-navigation.css"
import "@inglorious/ui/breadcrumbs.css"
import "@inglorious/ui/drawer.css"
import "@inglorious/ui/link.css"
import "@inglorious/ui/menu.css"
import "@inglorious/ui/pagination.css"
import "@inglorious/ui/speed-dial.css"
import "@inglorious/ui/stepper.css"
import "@inglorious/ui/tabs.css"

import { createIcons, Heart, Settings, User } from "lucide"

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
    const theme = context.globals.theme
    const themeClass = themeClasses[theme] || themeClasses.inglorious

    const mode = context.globals.mode
    const modeClass = mode === "light" ? "iw-theme-light" : "iw-theme-dark"

    document.body.className = document.body.className.replace(
      /iw-theme-(\w+)/g,
      "",
    )
    document.body.className += ` ${themeClass} ${modeClass}`

    const background =
      getComputedStyle(document.body)
        .getPropertyValue("--iw-color-bg")
        .trim() || (mode === "dark" ? "#111827" : "#ffffff")
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

    const result = story()
    hydrateLucide()

    return result
  },
]
