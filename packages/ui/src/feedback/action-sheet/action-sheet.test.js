import { render } from "@inglorious/web/test"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ActionSheet } from "."

describe("ActionSheet", () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it("is a sheet listing each action, with cancel set apart", () => {
    const container = mount(
      ActionSheet.render({
        isOpen: true,
        title: "Photo",
        actions: [{ label: "Share" }, { label: "Delete", color: "error" }],
        cancelLabel: "Annulla",
      }),
    )

    const dialog = container.querySelector("dialog")
    expect(dialog.classList.contains("iw-dialog-sheet")).toBe(true)
    expect(dialog.classList.contains("iw-action-sheet")).toBe(true)
    expect(
      [...container.querySelectorAll(".iw-action-sheet-action")].map((button) =>
        button.textContent.trim(),
      ),
    ).toEqual(["Share", "Delete"])
    expect(
      container.querySelector(".iw-action-sheet-cancel").textContent.trim(),
    ).toBe("Annulla")
  })

  it("runs the picked action, then closes", () => {
    const calls = []
    const container = mount(
      ActionSheet.render({
        isOpen: true,
        actions: [{ label: "Share", onClick: () => calls.push("share") }],
        onClose: () => calls.push("close"),
      }),
    )

    container.querySelector(".iw-action-sheet-action").click()

    expect(calls).toEqual(["share", "close"])
  })

  it("closes on cancel without running anything", () => {
    const onClick = vi.fn()
    const onClose = vi.fn()
    const container = mount(
      ActionSheet.render({
        isOpen: true,
        actions: [{ label: "Share", onClick }],
        onClose,
      }),
    )

    container.querySelector(".iw-action-sheet-cancel").click()

    expect(onClick).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("keeps a disabled action from running", () => {
    const onClick = vi.fn()
    const container = mount(
      ActionSheet.render({
        isOpen: true,
        actions: [{ label: "Share", isDisabled: true, onClick }],
      }),
    )

    container.querySelector(".iw-action-sheet-action").click()

    expect(onClick).not.toHaveBeenCalled()
  })
})

function mount(template) {
  const container = document.createElement("div")
  document.body.append(container)
  render(template, container)
  return container
}
