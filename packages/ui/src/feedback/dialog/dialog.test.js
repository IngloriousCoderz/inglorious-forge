import { render } from "@inglorious/web/test"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Dialog } from "."

describe("dialog", () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it("renders a native dialog, open when isOpen is set", async () => {
    const container = mount(
      Dialog.render({ isOpen: true, title: "Hello", description: "Details" }),
    )
    await settle()

    const dialog = container.querySelector("dialog.iw-dialog")
    expect(dialog.open).toBe(true)
    expect(container.querySelector(".iw-dialog-title").textContent.trim()).toBe(
      "Hello",
    )
  })

  it("stays in the DOM but closed when isOpen is false", async () => {
    const container = mount(Dialog.render({ isOpen: false }))
    await settle()

    expect(container.querySelector("dialog").open).toBe(false)
  })

  it("opens modally by default and in place when isModal is false", async () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, "showModal")
    const show = vi.spyOn(HTMLDialogElement.prototype, "show")

    mount(Dialog.render({ isOpen: true }))
    mount(Dialog.render({ isOpen: true, isModal: false }))
    await settle()

    expect(showModal).toHaveBeenCalledTimes(1)
    expect(show).toHaveBeenCalledTimes(1)
    vi.restoreAllMocks()
  })

  it("closes when isOpen turns false, without reporting a close", async () => {
    const onClose = vi.fn()
    const container = mount(Dialog.render({ isOpen: true, onClose }))
    await settle()

    render(Dialog.render({ isOpen: false, onClose }), container)

    expect(container.querySelector("dialog").open).toBe(false)
    expect(onClose).not.toHaveBeenCalled()
  })

  it("reports a close the browser makes on its own", async () => {
    const onClose = vi.fn()
    const container = mount(Dialog.render({ isOpen: true, onClose }))
    await settle()

    container.querySelector("dialog").close()

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("refuses Esc when nothing would close it", async () => {
    const container = mount(Dialog.render({ isOpen: true }))
    await settle()

    const cancel = new Event("cancel", { cancelable: true })
    container.querySelector("dialog").dispatchEvent(cancel)

    expect(cancel.defaultPrevented).toBe(true)
  })

  it("closes on a press that starts and ends on the backdrop", () => {
    const onClose = vi.fn()
    const container = mount(Dialog.render({ isOpen: true, onClose }))
    const dialog = container.querySelector("dialog")

    dialog.dispatchEvent(new Event("pointerdown", { bubbles: true }))
    dialog.click()

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("ignores a drag from the surface that ends on the backdrop", () => {
    const onClose = vi.fn()
    const container = mount(Dialog.render({ isOpen: true, onClose }))

    container
      .querySelector(".iw-dialog-surface")
      .dispatchEvent(new Event("pointerdown", { bubbles: true }))
    container.querySelector("dialog").click()

    expect(onClose).not.toHaveBeenCalled()
  })

  it("ignores clicks inside the surface", () => {
    const onClose = vi.fn()
    const container = mount(
      Dialog.render({ isOpen: true, title: "Hello", onClose }),
    )

    const title = container.querySelector(".iw-dialog-title")
    title.dispatchEvent(new Event("pointerdown", { bubbles: true }))
    title.click()

    expect(onClose).not.toHaveBeenCalled()
  })

  it("prefers onBackdropClick over onClose", () => {
    const onClose = vi.fn()
    const onBackdropClick = vi.fn()
    const container = mount(
      Dialog.render({ isOpen: true, onClose, onBackdropClick }),
    )
    const dialog = container.querySelector("dialog")

    dialog.dispatchEvent(new Event("pointerdown", { bubbles: true }))
    dialog.click()

    expect(onBackdropClick).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
  })

  it("labels the dialog by its title and description", () => {
    const container = mount(
      Dialog.render({ id: "confirm", title: "Hello", description: "Details" }),
    )
    const dialog = container.querySelector("dialog")

    expect(dialog.getAttribute("aria-labelledby")).toBe("confirm-title")
    expect(dialog.getAttribute("aria-describedby")).toBe("confirm-description")
  })

  it("is named by its description when it has no title", () => {
    const container = mount(
      Dialog.render({ id: "confirm", description: "Delete it?" }),
    )
    const dialog = container.querySelector("dialog")

    expect(dialog.getAttribute("aria-labelledby")).toBe("confirm-description")
    expect(dialog.hasAttribute("aria-describedby")).toBe(false)
  })

  it("takes a size", () => {
    const container = mount(Dialog.render({ size: "lg" }))

    expect(container.querySelector("dialog.iw-dialog-lg")).not.toBeNull()
  })

  it("names the close button in the app's language", () => {
    const container = mount(
      Dialog.render({ isOpen: true, closeLabel: "Chiudi", onClose: () => {} }),
    )

    expect(
      container.querySelector(".iw-dialog-close").getAttribute("aria-label"),
    ).toBe("Chiudi")
  })

  it("is a sheet only when asked", () => {
    const container = mount(Dialog.render({ isOpen: true, variant: "sheet" }))
    const plain = mount(Dialog.render({ isOpen: true }))

    expect(
      container.querySelector("dialog").classList.contains("iw-dialog-sheet"),
    ).toBe(true)
    expect(
      plain.querySelector("dialog").classList.contains("iw-dialog-sheet"),
    ).toBe(false)
  })

  describe("dragging a sheet", () => {
    const SHEET_HEIGHT = 400

    beforeEach(() => {
      vi.useFakeTimers()
      vi.stubGlobal("matchMedia", () => ({ matches: true }))
    })

    afterEach(() => {
      vi.useRealTimers()
      vi.unstubAllGlobals()
    })

    it("has a handle only when it can be dismissed", () => {
      const dismissible = mount(
        Dialog.render({ variant: "sheet", onClose: () => {} }),
      )
      const fixed = mount(Dialog.render({ variant: "sheet" }))
      const dialog = mount(Dialog.render({ onClose: () => {} }))

      expect(dismissible.querySelector(".iw-dialog-handle")).not.toBeNull()
      expect(fixed.querySelector(".iw-dialog-handle")).toBeNull()
      expect(dialog.querySelector(".iw-dialog-handle")).toBeNull()
    })

    it("follows the finger down and closes past a third of its height", () => {
      const onClose = vi.fn()
      const container = mount(Dialog.render({ variant: "sheet", onClose }))
      const sheet = sized(container.querySelector("dialog"))
      const handle = container.querySelector(".iw-dialog-handle")

      pointer(handle, "pointerdown", 100, 0)
      pointer(handle, "pointermove", 200, 1000)
      expect(sheet.style.transform).toBe("translateY(100px)")

      pointer(handle, "pointerup", 250, 1000)
      vi.runAllTimers()

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("closes on a quick flick", () => {
      const onClose = vi.fn()
      const container = mount(Dialog.render({ variant: "sheet", onClose }))
      sized(container.querySelector("dialog"))
      const handle = container.querySelector(".iw-dialog-handle")

      pointer(handle, "pointerdown", 100, 0)
      pointer(handle, "pointerup", 160, 50)
      vi.runAllTimers()

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("springs back from a short, slow drag", () => {
      const onClose = vi.fn()
      const container = mount(Dialog.render({ variant: "sheet", onClose }))
      const sheet = sized(container.querySelector("dialog"))
      const handle = container.querySelector(".iw-dialog-handle")

      pointer(handle, "pointerdown", 100, 0)
      pointer(handle, "pointermove", 140, 1000)
      pointer(handle, "pointerup", 140, 1000)
      vi.runAllTimers()

      expect(onClose).not.toHaveBeenCalled()
      expect(sheet.style.transform).toBe("")
    })

    it("leaves the close button to its click", () => {
      const onClose = vi.fn()
      const container = mount(
        Dialog.render({ variant: "sheet", title: "Hi", onClose }),
      )
      sized(container.querySelector("dialog"))
      const button = container.querySelector(".iw-dialog-close")

      pointer(button, "pointerdown", 100, 0)
      pointer(
        container.querySelector(".iw-dialog-header"),
        "pointerup",
        300,
        50,
      )
      vi.runAllTimers()

      expect(onClose).not.toHaveBeenCalled()
    })

    it("stays put on a wide screen, where it is a dialog", () => {
      vi.stubGlobal("matchMedia", () => ({ matches: false }))
      const onClose = vi.fn()
      const container = mount(Dialog.render({ variant: "sheet", onClose }))
      const sheet = sized(container.querySelector("dialog"))
      const handle = container.querySelector(".iw-dialog-handle")

      pointer(handle, "pointerdown", 100, 0)
      pointer(handle, "pointermove", 300, 1000)
      pointer(handle, "pointerup", 300, 1000)
      vi.runAllTimers()

      expect(sheet.style.transform).toBe("")
      expect(onClose).not.toHaveBeenCalled()
    })

    function sized(sheet) {
      Object.defineProperty(sheet, "offsetHeight", { value: SHEET_HEIGHT })
      return sheet
    }

    function pointer(target, type, clientY, timeStamp) {
      const event = new MouseEvent(type, { bubbles: true, button: 0, clientY })
      Object.defineProperty(event, "timeStamp", { value: timeStamp })
      target.dispatchEvent(event)
    }
  })
})

function mount(template) {
  const container = document.createElement("div")
  document.body.append(container)
  render(template, container)
  return container
}

function settle() {
  return Promise.resolve()
}
