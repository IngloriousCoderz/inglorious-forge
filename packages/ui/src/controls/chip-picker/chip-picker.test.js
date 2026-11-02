import { render } from "@inglorious/web/test"
import { describe, expect, it, vi } from "vitest"

import { ChipPicker } from "."

describe("chip picker", () => {
  it("marks the picked options and reports the one pressed", () => {
    const onToggle = vi.fn()
    const container = document.createElement("div")

    render(
      ChipPicker.render({
        label: "Professions",
        hint: "Pick any",
        options: [
          { value: "photo", label: "Photographer" },
          { value: "video", label: "Videographer" },
          "dj",
        ],
        value: ["video"],
        onToggle,
      }),
      container,
    )

    const chips = [...container.querySelectorAll("button.iw-chip")]
    expect(container.querySelector("legend").textContent).toBe("Professions")
    expect(chips.map((chip) => chip.getAttribute("aria-pressed"))).toEqual([
      "false",
      "true",
      "false",
    ])
    expect(chips[2].textContent.trim()).toBe("dj")

    chips[0].click()

    expect(onToggle).toHaveBeenCalledWith("photo")
  })

  it("disables every chip, or a single option", () => {
    const container = document.createElement("div")

    render(
      ChipPicker.render({
        options: ["a", { value: "b", label: "B", isDisabled: true }],
      }),
      container,
    )

    const chips = container.querySelectorAll("button.iw-chip")
    expect(chips[0].disabled).toBe(false)
    expect(chips[1].disabled).toBe(true)
  })
})
