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

    render(Toast.render({ toasts: [] }), container)

    expect(container.querySelector(".iw-toaster")).toBeNull()
  })

  it("stacks the toasts in a manual popover, newest first", async () => {
    const container = document.createElement("div")
    document.body.append(container)

    render(Toast.render({ toasts: TOASTS }), container)
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

    render(Toast.render({ toasts: TOASTS, onClose }), container)
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

    render(Toast.render({ toasts: TOASTS, onClose }), container)
    container
      .querySelector(".iw-toast")
      .dispatchEvent(new Event("animationend", { bubbles: true }))

    expect(onClose).not.toHaveBeenCalled()
  })

  it("staggers toasts by their place in the stack", () => {
    const container = document.createElement("div")

    render(Toast.render({ toasts: TOASTS }), container)

    const orders = [...container.querySelectorAll(".iw-toast")].map((toast) =>
      toast.style.getPropertyValue("--iw-toast-order").trim(),
    )
    expect(orders).toEqual(["0", "1"])
  })

  it("times each toast by its own duration or the stack's", () => {
    const container = document.createElement("div")

    render(
      Toast.render({
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

    render(Toast.render({ toasts: TOASTS, onClick }), container)
    container.querySelector("button.iw-toast-main").click()

    expect(onClick).toHaveBeenCalledWith(2)
  })
})
