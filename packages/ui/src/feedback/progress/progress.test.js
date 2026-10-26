import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Progress } from "."

describe("progress", () => {
  it("renders linear determinate as a native progress", () => {
    const container = document.createElement("div")

    render(Progress.render({ variant: "linear", value: 50 }), container)

    const progress = container.querySelector("progress.iw-progress-linear")
    expect(progress.getAttribute("value")).toBe("50")
    expect(progress.getAttribute("max")).toBe("100")
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

  it("clamps linear value to 100", () => {
    const container = document.createElement("div")

    render(Progress.render({ variant: "linear", value: 140 }), container)

    expect(container.querySelector("progress").getAttribute("value")).toBe(
      "100",
    )
  })

  it("is indeterminate without a value, even after having one", () => {
    const container = document.createElement("div")

    render(Progress.render({ variant: "linear", value: 30 }), container)
    render(Progress.render({ variant: "linear" }), container)

    const progress = container.querySelector("progress")
    expect(progress.hasAttribute("value")).toBe(false)
    expect(progress.classList.contains("iw-progress-indeterminate")).toBe(true)
  })

  it("names the indicator with ariaLabel", () => {
    const container = document.createElement("div")

    render(Progress.render({ value: 10, ariaLabel: "Uploading" }), container)

    expect(container.querySelector("progress").getAttribute("aria-label")).toBe(
      "Uploading",
    )
  })

  it("renders circular determinate as a progressbar", () => {
    const props = { variant: "circular", value: 50, size: 40, thickness: 4 }
    const container = document.createElement("div")

    render(Progress.render(props), container)

    const circle = container.querySelector(".iw-progress-circular")
    expect(circle.getAttribute("role")).toBe("progressbar")
    expect(circle.getAttribute("aria-valuenow")).toBe("50")
  })

  it("leaves aria-valuenow out of an indeterminate circle", () => {
    const container = document.createElement("div")

    render(Progress.render({ variant: "circular" }), container)

    expect(
      container
        .querySelector(".iw-progress-circular")
        .hasAttribute("aria-valuenow"),
    ).toBe(false)
  })
})
