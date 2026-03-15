import { html, repeat } from "@inglorious/web"

import { materialIcon } from "."

const materialIcons = [
  "search",
  "home",
  "menu",
  "settings",
  "favorite",
  "visibility",
  "notifications",
  "shopping_cart",
  "person",
  "calendar_today",
  "mail",
  "chat",
  "help",
  "info",
  "warning",
  "check_circle",
  "cancel",
  "delete",
  "download",
  "upload",
  "lock",
  "star",
  "play_arrow",
  "pause",
  "stop",
  "cloud",
  "camera_alt",
  "bolt",
  "palette",
  "code",
  "analytics",
  "schedule",
]

export default {
  title: "Data Display/Material Icon",
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    isFilled: {
      control: "boolean",
    },
    columns: {
      control: "number",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Material Symbols icon set (requires Material Symbols font to be loaded).",
      },
    },
  },
}

export const Gallery = {
  args: {
    size: "lg",
    isFilled: false,
    columns: 6,
  },
  render: (args) => {
    const columns = Math.max(4, Number(args.columns ?? 6))
    const size = args.size ?? "lg"
    const isFilled = Boolean(args.isFilled)

    return html`
      <div
        style=${[
          "display: grid",
          `grid-template-columns: repeat(${columns}, minmax(0, 1fr))`,
          "gap: 1rem",
          "align-items: center",
          "justify-items: center",
        ].join("; ")}
      >
        ${repeat(
          materialIcons,
          (name) => name,
          (name) =>
            materialIcon.render({
              name,
              size,
              isFilled,
            }),
        )}
      </div>
    `
  },
}
