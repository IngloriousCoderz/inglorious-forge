import { render } from "@inglorious/web/test"
import { afterEach, describe, expect, it, vi } from "vitest"

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
