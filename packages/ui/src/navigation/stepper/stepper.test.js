import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Stepper } from "."

describe("stepper", () => {
  it("renders all steps", () => {
    const container = document.createElement("div")

    render(
      Stepper.render({ steps: [{ label: "A" }, { label: "B" }] }),
      container,
    )

    expect(container.querySelectorAll(".iw-stepper-step")).toHaveLength(2)
  })

  it("marks the active step", () => {
    const container = document.createElement("div")

    render(
      Stepper.render({
        activeStep: 1,
        steps: [{ label: "A" }, { label: "B" }],
      }),
      container,
    )

    expect(container.querySelector(".iw-stepper-step-active")).not.toBeNull()
  })
})
