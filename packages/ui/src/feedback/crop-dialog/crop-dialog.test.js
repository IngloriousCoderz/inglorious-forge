import { html } from "@inglorious/web"
import { render } from "@inglorious/web/test"
import { describe, expect, it, vi } from "vitest"

import { CropDialog } from "."

const rect = { x: 0, y: 0, w: 1, h: 1 }

function renderDialog(cropper, props = {}) {
  const api = {
    getEntity: () => cropper,
    render: () => html`<div class="cropper"></div>`,
  }
  const container = document.createElement("div")
  render(
    CropDialog.render({ isOpen: true, cropperId: "cropper", ...props }, api),
    container,
  )
  return container
}

function buttons(container) {
  return [...container.querySelectorAll(".iw-crop-dialog-actions button")]
}

describe("crop dialog", () => {
  it("applies the cropper's rect once the image has loaded", () => {
    const onApply = vi.fn()
    const container = renderDialog({ naturalWidth: 800, rect }, { onApply })

    expect(container.querySelector(".cropper")).not.toBeNull()
    const [, apply] = buttons(container)
    expect(apply.disabled).toBe(false)

    apply.click()

    expect(onApply).toHaveBeenCalledWith(rect)
  })

  it("keeps apply disabled until the image loads", () => {
    const [, apply] = buttons(renderDialog({ naturalWidth: 0, rect }))

    expect(apply.disabled).toBe(true)
  })

  it("shows the caller's error ahead of a failed load", () => {
    const failed = renderDialog(
      { hasError: true },
      { loadErrorText: "Bad image" },
    )
    expect(failed.querySelector(".iw-crop-dialog-error").textContent).toContain(
      "Bad image",
    )

    const blank = renderDialog(
      { hasError: true },
      { loadErrorText: "Bad image", error: "" },
    )
    expect(blank.querySelector(".iw-crop-dialog-error").textContent).toContain(
      "Bad image",
    )

    const both = renderDialog(
      { hasError: true },
      { loadErrorText: "Bad image", error: "Upload failed" },
    )
    expect(both.querySelector(".iw-crop-dialog-error").textContent).toContain(
      "Upload failed",
    )
  })

  it("shows the saving label and blocks both buttons while saving", () => {
    const [cancel, apply] = buttons(
      renderDialog({ naturalWidth: 800, rect }, { isSaving: true }),
    )

    expect(apply.textContent.trim()).toBe("Saving…")
    expect(apply.disabled).toBe(true)
    expect(cancel.disabled).toBe(true)
  })
})
