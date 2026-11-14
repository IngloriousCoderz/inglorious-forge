import { Container } from "@inglorious/ui/container"
import { Input } from "@inglorious/ui/input"
import { Select } from "@inglorious/ui/select"
import { Switch } from "@inglorious/ui/switch"
import { html } from "@inglorious/web"
import { haptics } from "@inglorious/web/device/haptics"

import { themes } from "../themes.js"

export const Settings = {
  themeChange(entity, theme) {
    entity.theme = theme
  },

  darkToggle(entity, isDark) {
    entity.isDark = isDark
  },

  render(entity, api) {
    return Container.render({
      maxWidth: "md",
      padding: "lg",
      children: html`
        <div class="settings">
          ${Select.render({
            label: "Theme",
            value: entity.theme,
            options: themes,
            isFullWidth: true,
            onChange: (theme) => api.notify("#settings:themeChange", theme),
          })}
          ${Switch.render({
            label: "Dark mode",
            isChecked: entity.isDark,
            onChange: (isDark) => {
              haptics.selection()
              api.notify("#settings:darkToggle", isDark)
            },
          })}
          ${Input.render({
            label: "Nickname",
            placeholder: "The tab bar hides while you type",
            isFullWidth: true,
          })}
        </div>
      `,
    })
  },
}
