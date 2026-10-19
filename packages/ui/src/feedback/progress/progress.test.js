import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Progress } from "."

describe("progress", () => {
  it("renders linear determinate", () => {
    const props = { variant: "linear", value: 50 }
    const container = document.createElement("div")

    render(Progress.render(props), container)

    const bar = container.querySelector(".iw-progress-linear-bar")
    expect(bar.style.width).toBe("50%")
  })

  it("applies color to the linear variant", () => {
    const container = document.createElement("div")

    render(
      Progress.render({ variant: "linear", value: 50, color: "success" }),
      container,
    )

    const progress = container.querySelector(".iw-progress-linear")
    expect(progress.classList.contains("iw-progress-success")).toBe(true)
  })

  it("renders circular determinate", () => {
    const props = { variant: "circular", value: 50, size: 40, thickness: 4 }
    const container = document.createElement("div")

    render(Progress.render(props), container)

    expect(container.querySelector(".iw-progress-circular")).not.toBeNull()
  })

  it("clamps linear value to 100", () => {
    const container = document.createElement("div")

    render(Progress.render({ variant: "linear", value: 140 }), container)

    const bar = container.querySelector(".iw-progress-linear-bar")
    expect(bar.style.width).toBe("100%")
  })

  it("renders indeterminate class when value is omitted", () => {
    const container = document.createElement("div")

    render(Progress.render({ variant: "linear" }), container)

    expect(
      container
        .querySelector(".iw-progress-linear")
        .classList.contains("iw-progress-indeterminate"),
    ).toBe(true)
  })
})
