import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { buttonGroup } from "."

describe("buttonGroup", () => {
  it("renders grouped buttons", () => {
    const props = {
      buttons: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
    }
    const container = document.createElement("div")

    render(buttonGroup.render(props), container)

    expect(container.querySelectorAll("button").length).toBe(2)
    expect(container.querySelector(".iw-button-group")).not.toBeNull()
  })

  it("dispatches click payload", () => {
    let selectedValues = null
    const props = {
      buttons: [{ label: "A", value: "alpha" }],
      onChange: (values) => (selectedValues = values),
    }
    const container = document.createElement("div")

    render(buttonGroup.render(props), container)

    container.querySelector("button").click()

    expect(selectedValues).toBe("alpha")
  })

  it("dispatches change payload in single selection mode", () => {
    let selectedValues = null
    const props = {
      value: "a",
      buttons: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
      onChange: (values) => (selectedValues = values),
    }
    const container = document.createElement("div")

    render(buttonGroup.render(props), container)

    container.querySelectorAll("button")[1].click()

    expect(selectedValues).toBe("b")
  })

  it("dispatches change payload array in multiple selection mode", () => {
    let selectedValues = null
    const props = {
      multiple: true,
      value: ["a"],
      buttons: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
      onChange: (values) => (selectedValues = values),
    }
    const container = document.createElement("div")

    render(buttonGroup.render(props), container)

    container.querySelectorAll("button")[1].click()

    expect(selectedValues).toEqual(["a", "b"])
  })
})
