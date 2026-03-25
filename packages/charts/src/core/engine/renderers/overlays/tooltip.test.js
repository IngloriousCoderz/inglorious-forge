import { describe, expect, it } from "vitest"

import { hideTooltip, showTooltip } from "./tooltip.js"

function createSvgStub() {
  const state = {
    transform: null,
    display: null,
    dotFill: null,
    labelText: "",
    valueText: "",
  }

  const group = {
    setAttribute(name, value) {
      if (name === "transform") state.transform = value
      if (name === "display") state.display = value
    },
    getAttribute(name) {
      if (name === "transform") return state.transform
      if (name === "display") return state.display
      return null
    },
    querySelector(selector) {
      if (selector === '[data-role="dot"]') {
        return {
          setAttribute(name, value) {
            if (name === "fill") state.dotFill = value
          },
        }
      }

      if (selector === '[data-role="label"]') {
        return {
          set textContent(value) {
            state.labelText = value
          },
          get textContent() {
            return state.labelText
          },
        }
      }

      if (selector === '[data-role="value"]') {
        return {
          set textContent(value) {
            state.valueText = value
          },
          get textContent() {
            return state.valueText
          },
        }
      }
      return null
    },
  }

  return {
    state,
    svgEl: {
      inserted: false,
      querySelector(selector) {
        if (selector === ".iw-chart-modal-fallback" && this.inserted) {
          return group
        }

        return null
      },
      insertAdjacentHTML() {
        this.inserted = true
      },
    },
  }
}

describe("tooltip runtime", () => {
  it("shows tooltip content inside the svg", () => {
    const { svgEl, state } = createSvgStub()

    showTooltip(svgEl, 10, 20, "Revenue", "60%", "#ff0000")

    expect(state.transform).toBe("translate(10, 20)")
    expect(state.display).toBe("inline")
    expect(state.dotFill).toBe("#ff0000")
    expect(state.labelText).toBe("Revenue")
    expect(state.valueText).toBe("60%")
  })

  it("hides tooltip content", () => {
    const { svgEl, state } = createSvgStub()

    showTooltip(svgEl, 10, 20, "Revenue", 123, "#ff0000")
    hideTooltip(svgEl)

    expect(state.display).toBe("none")
  })
})
