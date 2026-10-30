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
