const openPopovers = new WeakSet()

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.show = function () {
    this.open = true
  }

  HTMLDialogElement.prototype.showModal = function () {
    this.open = true
  }

  HTMLDialogElement.prototype.close = function () {
    if (!this.open) return
    this.open = false
    this.dispatchEvent(new Event("close"))
  }
}

if (!HTMLElement.prototype.showPopover) {
  Object.defineProperty(HTMLElement.prototype, "popover", {
    get() {
      return this.getAttribute("popover")
    },
  })

  HTMLElement.prototype.showPopover = function () {
    if (openPopovers.has(this)) return
    openPopovers.add(this)
    this.dispatchEvent(Object.assign(new Event("toggle"), { newState: "open" }))
  }

  HTMLElement.prototype.hidePopover = function () {
    if (!openPopovers.has(this)) return
    openPopovers.delete(this)
    this.dispatchEvent(
      Object.assign(new Event("toggle"), { newState: "closed" }),
    )
  }
}

/**
 * Whether a popover was shown with the stand-in `showPopover()`.
 * jsdom cannot match `:popover-open`, so tests ask this instead.
 * @param {Element} element
 */
export function isPopoverOpen(element) {
  return openPopovers.has(element)
}
