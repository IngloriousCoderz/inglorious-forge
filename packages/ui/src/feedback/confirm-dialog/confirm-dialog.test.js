import { render } from "@inglorious/web/test"
import { describe, expect, it, vi } from "vitest"

import { ConfirmDialog } from "."

function renderDialog(props) {
  const container = document.createElement("div")
  render(
    ConfirmDialog.render({ isOpen: true, confirmLabel: "Delete", ...props }),
    container,
  )
  return container
}

describe("confirm dialog", () => {
  it("confirms and cancels", () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const container = renderDialog({
      message: "Delete it?",
      onConfirm,
      onCancel,
    })

    const [confirm, cancel] = container.querySelectorAll(
      ".iw-confirm-dialog-actions button",
    )
    expect(
      container.querySelector(".iw-dialog-description").textContent,
    ).toContain("Delete it?")
    expect(confirm.textContent.trim()).toBe("Delete")
    expect(cancel.textContent.trim()).toBe("Cancel")

    confirm.click()
    cancel.click()

    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it("shows the busy label and blocks both buttons while busy", () => {
    const onConfirm = vi.fn()
    const container = renderDialog({
      busyLabel: "Deleting…",
      isBusy: true,
      onConfirm,
    })

    const [confirm, cancel] = container.querySelectorAll(
      ".iw-confirm-dialog-actions button",
    )
    expect(confirm.textContent.trim()).toBe("Deleting…")
    expect(confirm.disabled).toBe(true)
    expect(cancel.disabled).toBe(true)
    expect(container.querySelector(".iw-dialog-close")).toBeNull()
  })

  it("uses the primary color for a harmless action", () => {
    const container = renderDialog({ tone: "primary" })

    const confirm = container.querySelector(".iw-confirm-dialog-actions button")
    expect(confirm.className).toContain("primary")
  })
})
