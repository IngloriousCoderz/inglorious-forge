const ONE_HOUR_MS = 3_600_000
const TAKEOVER_TIMEOUT_MS = 3_000
const VISIBILITY_EVENT = "visibilitychange"

/**
 * Keeps an installed PWA on its latest version: applies a waiting version at
 * boot and on each trip to or from the background, checks for a new one every
 * `checkEveryMs` and on each return to the foreground, and calls `onReady`
 * when a version lands mid-session.
 *
 * @param {ServiceWorkerRegistration} registration
 * @param {() => void} [onReady]
 * @param {{ checkEveryMs?: number }} [options]
 * @returns {() => void} Stops watching.
 */
export function watchPwaUpdate(
  registration,
  onReady,
  { checkEveryMs = ONE_HOUR_MS } = {},
) {
  const hadController = Boolean(navigator.serviceWorker?.controller)
  let announced = null
  let isApplying = false

  apply()
  watchInstalls()
  const interval = setInterval(check, checkEveryMs)
  document.addEventListener(VISIBILITY_EVENT, handleVisibilityChange)

  return function stop() {
    clearInterval(interval)
    document.removeEventListener(VISIBILITY_EVENT, handleVisibilityChange)
  }

  function check() {
    registration.update?.()?.catch?.(() => {})
  }

  function handleVisibilityChange() {
    if (apply()) return
    if (!document.hidden) check()
  }

  // One reload per waiting worker: the hidden and visible events of a single
  // trip to the background must not send it twice, nor check for another
  // version while the reload is on its way.
  function apply() {
    if (isApplying) return true
    if (!registration.waiting) return false
    isApplying = true
    applyPwaUpdate(registration)
    return true
  }

  function announce(worker) {
    if (!hadController || isApplying || announced === worker) return
    announced = worker
    onReady?.()
  }

  function watchInstalls() {
    if (registration.waiting) announce(registration.waiting)
    registration.addEventListener("updatefound", () => {
      const worker = registration.installing
      worker?.addEventListener("statechange", () => {
        if (worker.state === "installed") announce(worker)
        if (worker.state === "activated") announced = null
      })
    })
  }
}

/**
 * Moves the page over to the waiting version: asks the worker to take over
 * with the SKIP_WAITING message that workbox's generated worker listens for,
 * and reloads once it has — not before, or the page just reopens on the old
 * version. With nothing waiting it simply reloads.
 *
 * @param {ServiceWorkerRegistration} [registration] Looked up when omitted.
 * @returns {Promise<void>}
 */
export async function applyPwaUpdate(registration) {
  const target =
    registration ?? (await navigator.serviceWorker?.getRegistration())
  const worker = target?.waiting
  if (worker) await takeOver(worker)
  location.reload()
}

// Bounded: a worker that never reports back still gets the page reloaded.
function takeOver(worker) {
  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, TAKEOVER_TIMEOUT_MS)
    worker.addEventListener("statechange", () => {
      if (worker.state !== "activated") return
      clearTimeout(timeout)
      resolve()
    })
    worker.postMessage({ type: "SKIP_WAITING" })
  })
}
