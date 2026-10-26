/**
 * Native `<dialog>` and `popover` elements keep their own open state, while the
 * components that use them are driven by an `isOpen` prop from the store. These
 * helpers run from a `ref` on every render and keep the two in step: the prop
 * opens and closes the element, and a change the browser makes on its own
 * (Esc, a light dismiss, a `method="dialog"` form, a `commandfor` invoker) is
 * reported through `onClose` or `onOpen` so the store can catch up.
 *
 * The browser fires `close` and `toggle` after the fact, so the handler tells
 * the two apart by the latest props: a change the props asked for finds
 * `isOpen` already matching, and only one they did not ask for is reported.
 */

/**
 * Latest props per element. The listener is added once, and reads the props
 * from here so it never calls an `onClose` captured by an earlier render.
 * @type {WeakMap<Element, { isOpen: boolean, isModal?: boolean, onOpen?: () => void, onClose?: () => void }>}
 */
const latestProps = new WeakMap()

/**
 * Opens or closes a `<dialog>` to match `isOpen`.
 * @param {HTMLDialogElement | undefined} element
 * @param {{ isOpen: boolean, isModal?: boolean, onClose?: () => void }} props
 */
export function syncDialog(element, props) {
  if (!element) return
  track(element, props, "close", () => false)
  whenConnected(element, () => {
    const { isOpen, isModal = true } = latestProps.get(element)
    if (isOpen && !element.open) {
      if (isModal) element.showModal()
      else element.show()
    }
    if (!isOpen && element.open) element.close()
  })
}

/**
 * Shows or hides a `popover` element to match `isOpen`. Showing an open
 * popover and hiding a closed one are no-ops, so no state check is needed.
 * @param {HTMLElement | undefined} element
 * @param {{ isOpen: boolean, onOpen?: () => void, onClose?: () => void }} props
 */
export function syncPopover(element, props) {
  if (!element) return
  track(element, props, "toggle", (event) => event.newState === "open")
  whenConnected(element, () => {
    if (!element.popover) return
    if (latestProps.get(element).isOpen) element.showPopover()
    else element.hidePopover()
  })
}

/**
 * @param {Element} element
 * @param {object} props
 * @param {string} eventName
 * @param {(event: Event) => boolean} isOpenAfter whether the event left it open
 */
function track(element, props, eventName, isOpenAfter) {
  const isTracked = latestProps.has(element)
  latestProps.set(element, props)
  if (isTracked) return

  element.addEventListener(eventName, (event) => {
    const latest = latestProps.get(element)
    const isOpen = isOpenAfter(event)
    if (isOpen === latest.isOpen) return
    if (isOpen) latest.onOpen?.()
    else latest.onClose?.()
  })
}

/**
 * A ref runs while a new template is still in its fragment, and neither
 * `showModal()` nor `showPopover()` works on an element outside the document.
 * The fragment is inserted synchronously after, so a microtask is late enough.
 */
function whenConnected(element, callback) {
  if (element.isConnected) callback()
  else queueMicrotask(() => element.isConnected && callback())
}
