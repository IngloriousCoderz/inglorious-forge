import { render } from "@inglorious/web/test"
import { describe, expect, it, vi } from "vitest"

import { isPopoverOpen } from "../../../vitest.setup.js"
import { Toast } from "."

const TOASTS = [
  {
    id: 2,
    title: "You got the job",
    message: "Wedding in Tuscany",
    color: "success",
  },
  { id: 1, message: "Saved" },
]

describe("toast", () => {
  it("renders nothing without toasts", () => {
    const container = document.createElement("div")

    render(Toast.renderToaster({ toasts: [] }), container)

    expect(container.querySelector(".iw-toaster")).toBeNull()
  })

  it("stacks the toasts in a manual popover, newest first", async () => {
    const container = document.createElement("div")
    document.body.append(container)

    render(Toast.renderToaster({ toasts: TOASTS }), container)
    await Promise.resolve()

    const toaster = container.querySelector(".iw-toaster")
    expect(toaster.getAttribute("popover")).toBe("manual")
    expect(toaster.classList.contains("iw-toaster-top-right")).toBe(true)
    expect(isPopoverOpen(toaster)).toBe(true)
    const toasts = [...container.querySelectorAll(".iw-toast-card")]
    expect(
      toasts.map((toast) => toast.textContent.replace(/\s+/g, " ").trim()),
    ).toEqual(["You got the job Wedding in Tuscany", "Saved"])
    expect(toasts[0].classList.contains("iw-toast-success")).toBe(true)
    expect(toasts[1].classList.contains("iw-toast-default")).toBe(true)
    container.remove()
  })

  it("plays the exit before closing, from the button or the timer", () => {
    const onClose = vi.fn()
    const container = document.createElement("div")

    render(Toast.renderToaster({ toasts: TOASTS, onClose }), container)
    const [first, second] = container.querySelectorAll(".iw-toast")
    first.querySelector(".iw-toast-close").click()
    second
      .querySelector(".iw-toast-timer")
      .dispatchEvent(new Event("animationend", { bubbles: true }))

    expect(first.classList.contains("iw-toast-leaving")).toBe(true)
    expect(second.classList.contains("iw-toast-leaving")).toBe(true)
    expect(onClose).not.toHaveBeenCalled()

    first.dispatchEvent(new Event("animationend", { bubbles: true }))
    second.dispatchEvent(new Event("animationend", { bubbles: true }))

    expect(onClose.mock.calls).toEqual([[2], [1]])
  })

  it("ignores the entrance ending", () => {
    const onClose = vi.fn()
    const container = document.createElement("div")

    render(Toast.renderToaster({ toasts: TOASTS, onClose }), container)
    container
      .querySelector(".iw-toast")
      .dispatchEvent(new Event("animationend", { bubbles: true }))

    expect(onClose).not.toHaveBeenCalled()
  })

  it("staggers toasts by their place in the stack", () => {
    const container = document.createElement("div")

    render(Toast.renderToaster({ toasts: TOASTS }), container)

    const orders = [...container.querySelectorAll(".iw-toast")].map((toast) =>
      toast.style.getPropertyValue("--iw-toast-order").trim(),
    )
    expect(orders).toEqual(["0", "1"])
  })

  it("times each toast by its own duration or the stack's", () => {
    const container = document.createElement("div")

    render(
      Toast.renderToaster({
        toasts: [
          { id: 1, message: "Quick", duration: 2000 },
          { id: 2, message: "Default" },
          { id: 3, message: "Sticky", duration: null },
        ],
        duration: 8000,
        onClose: () => {},
      }),
      container,
    )

    const [quick, normal, sticky] = container.querySelectorAll(".iw-toast")
    expect(quick.getAttribute("style")).toContain("2000ms")
    expect(normal.getAttribute("style")).toContain("8000ms")
    expect(sticky.querySelector(".iw-toast-timer")).toBeNull()
  })

  it("makes toasts buttons when they can be clicked", () => {
    const onClick = vi.fn()
    const container = document.createElement("div")

    render(Toast.renderToaster({ toasts: TOASTS, onClick }), container)
    container.querySelector("button.iw-toast-main").click()

    expect(onClick).toHaveBeenCalledWith(2)
  })
})

describe("toast entity", () => {
  function entity(fields = {}) {
    const toasts = { id: "toasts", type: "Toast", ...fields }
    Toast.create(toasts)
    return toasts
  }

  it("shows the newest on top, up to max, with ids of its own", () => {
    const toasts = entity({ max: 2 })
    Toast.show(toasts, { message: "a" })
    Toast.show(toasts, { message: "b", path: "/b" })
    Toast.show(toasts, { message: "c" })

    expect(toasts.toasts).toEqual([
      { message: "c", id: 3 },
      { message: "b", path: "/b", id: 2 },
    ])
  })

  it("replaces a toast shown again with the same id", () => {
    const toasts = entity()
    Toast.show(toasts, { id: "sync", message: "Syncing" })
    Toast.show(toasts, { id: "sync", message: "Synced" })

    expect(toasts.toasts).toEqual([{ id: "sync", message: "Synced" }])
  })

  it("closes one, or clears them all", () => {
    const toasts = entity()
    Toast.show(toasts, { message: "a" })
    Toast.show(toasts, { message: "b" })

    Toast.close(toasts, 1)
    expect(toasts.toasts.map((toast) => toast.message)).toEqual(["b"])

    Toast.clear(toasts)
    expect(toasts.toasts).toEqual([])
  })

  it("renders the stack and closes through events", () => {
    const toasts = entity()
    Toast.show(toasts, { message: "a" })
    const api = { notify: vi.fn() }
    const container = document.createElement("div")

    render(Toast.render(toasts, api), container)
    const toast = container.querySelector(".iw-toast")
    toast.querySelector(".iw-toast-close").click()
    toast.dispatchEvent(new Event("animationend", { bubbles: true }))

    expect(api.notify).toHaveBeenCalledWith("#toasts:close", 1)
    expect(container.querySelector("button.iw-toast-main")).toBeNull()
  })

  it("makes toasts buttons when the type can open them", () => {
    const Openable = { ...Toast, open: () => {} }
    const toasts = entity()
    Toast.show(toasts, { message: "a" })
    const api = { notify: vi.fn() }
    const container = document.createElement("div")

    render(Openable.render(toasts, api), container)
    container.querySelector("button.iw-toast-main").click()

    expect(api.notify).toHaveBeenCalledWith("#toasts:open", 1)
  })
})
