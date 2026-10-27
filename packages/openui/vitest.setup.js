/* jsdom implements no `<dialog>` show methods. These stand-ins do what
   Inglorious UI's Dialog relies on: track the open state and fire `close`. */

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
