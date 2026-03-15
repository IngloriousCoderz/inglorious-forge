import { html, repeat } from "@inglorious/web"
import { list as virtualList } from "@inglorious/web/list"

import { button } from "../../controls/button"
import {
  createEntityRender,
  notifyActionArgType,
} from "../../stories/notifyStory.js"
import { icon } from "."

const unicodeList = {
  ...virtualList,

  create(entity) {
    virtualList.create(entity)

    const items = []
    let rowIndex = 0
    let row = []

    for (let code = entity.start; code <= entity.end; code += 1) {
      row.push(code)
      if (row.length >= entity.columns) {
        items.push({ id: `row-${rowIndex}`, codes: row })
        row = []
        rowIndex += 1
      }
    }

    if (row.length) {
      items.push({ id: `row-${rowIndex}`, codes: row })
    }

    entity.items = items
  },

  render(entity, api) {
    return virtualList.render(entity, {
      ...api,
      getType: () => unicodeList,
    })
  },

  renderItem(entity, { item }) {
    const { columns = 16, size = "md" } = entity
    const codes = item.codes ?? []

    return html`
      <div
        style=${[
          "display: grid",
          `grid-template-columns: repeat(${columns}, minmax(0, 1fr))`,
          "gap: 0.5rem",
          "align-items: center",
        ].join("; ")}
      >
        ${repeat(
          codes,
          (code) => code,
          (code) => {
            const glyph = String.fromCodePoint(code)
            const label = `Copy U+${code
              .toString(16)
              .toUpperCase()
              .padStart(4, "0")}`

            return button.render({
              id: code,
              variant: "ghost",
              color: "default",
              size: "sm",
              shape: "square",
              ariaLabel: label,
              onClick: () => copyGlyph(glyph),
              children: icon.render({
                children: glyph,
                size,
                color: "current",
              }),
            })
          },
        )}
      </div>
    `
  },
}

export default {
  title: "Data Display/Icon",
  render: createEntityRender({ unicodeList }),
  argTypes: {
    ...notifyActionArgType,
    start: {
      control: "number",
      description: "Start code point (decimal).",
    },
    end: {
      control: "number",
      description: "End code point (decimal).",
    },
    columns: {
      control: "number",
      description: "Grid columns for the glyphs.",
    },
    viewportHeight: {
      control: "number",
      description: "Viewport height for the virtualized list (px).",
    },
    estimatedHeight: {
      control: "number",
      description: "Estimated row height for virtualization (px).",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Unicode glyph explorer for the icon primitive. Click a glyph to copy it.",
      },
    },
  },
}

export const Unicode = {
  args: {
    id: "unicodeList",
    type: "unicodeList",
    start: 0,
    end: 129799,
    columns: 20,
    viewportHeight: 600,
    estimatedHeight: 56,
    size: "lg",
  },
}

async function copyGlyph(glyph) {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(glyph)
    return
  }

  const textarea = document.createElement("textarea")
  textarea.value = glyph
  textarea.setAttribute("readonly", "")
  textarea.style.position = "absolute"
  textarea.style.left = "-9999px"
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand("copy")
  document.body.removeChild(textarea)
}
