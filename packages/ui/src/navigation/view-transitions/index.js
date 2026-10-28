/**
 * @typedef {import("../../../types/navigation/view-transitions").TransitionsStore} Store
 * @typedef {import("../../../types/navigation/view-transitions").ViewTransitionType} ViewTransitionType
 * @typedef {import("../../../types/navigation/view-transitions").TransitionsOptions} TransitionsOptions
 * @typedef {(store: Store) => Store} Middleware
 */

/**
 * A store middleware that runs the renders which follow a navigation inside a
 * view transition, tagged with the direction they navigated in. Pair it with
 * `style.css` from this package, which turns those tags into a slide.
 *
 * The store is returned unchanged apart from its `subscribe`, which fans out to
 * every listener instead of subscribing to the store once per listener.
 *
 * Requires the `Router` type from `@inglorious/web`: direction is read from the
 * index the Router stamps into each history entry, and without it every
 * navigation looks like a replacement and slides the wrong way.
 *
 * @example
 * import { withTransitions } from "@inglorious/ui/view-transitions"
 * import "@inglorious/ui/view-transitions.css"
 *
 * const store = createStore({ types, entities, middlewares: [withTransitions()] })
 *
 * Pass `routes` to choose which navigations animate; the rest change page
 * without a transition. A list of route names animates every navigation into
 * or out of one of them. A function receives `{ type, from, to }`, where `type`
 * is the direction read from the history and `from` / `to` carry the `path`,
 * `index` and `route` of each side, and returns whether to animate.
 *
 * @example
 * // Slide into and out of detail pages; switch tabs instantly.
 * withTransitions({ routes: ["eventDetail", "userDetail"] })
 *
 * @example
 * // Slide only when going deeper or coming back up, never sideways.
 * withTransitions({
 *   routes: ({ from, to }) => from.path.startsWith(to.path) || to.path.startsWith(from.path),
 * })
 *
 * @param {TransitionsOptions} [options]
 * @returns {Middleware} The middleware, which returns the store it is given with a
 *   wrapped `subscribe`, and throws if the store has no `Router` type.
 */
export function withTransitions({ routes } = {}) {
  return (store) => wrapStore(store, routes)
}

function wrapStore(store, routes) {
  if (!store.getType("Router")) {
    throw new Error(
      '[withTransitions] Requires the "Router" type from @inglorious/web. The ' +
        "direction of a transition is read from the index the Router stamps " +
        "into each history entry.",
    )
  }

  const subscribe = store.subscribe
  const shouldTransition = toPredicate(routes)
  const listeners = new Set()

  let currentPath = ""
  let currentIndex = 0
  let currentRoute
  let unsubscribeStore = null

  store.subscribe = (listener) => {
    /* Taken here rather than when the store is wrapped, so that anything that
       navigated in between — an initial redirect, a renderer mounting late — is
       part of the baseline instead of a navigation in its own right. It also
       keeps `window` untouched until something subscribes, so wrapping a store
       during a server render is harmless. */
    if (!unsubscribeStore) {
      currentPath = getPath()
      currentIndex = getIndex()
      currentRoute = getRoute(store.getState())
      unsubscribeStore = subscribe.call(store, onStateChange)
    }

    listeners.add(listener)

    return () => {
      listeners.delete(listener)

      if (!listeners.size) {
        unsubscribeStore?.()
        unsubscribeStore = null
      }
    }
  }

  function onStateChange() {
    const path = getPath()
    const index = getIndex()
    const route = getRoute(store.getState())
    /* Both are compared against the baseline before it moves forward,
     * otherwise the comparison would always be against itself and every
     * navigation would read as a replacement. */
    const hasNavigated = path !== currentPath
    const from = { path: currentPath, index: currentIndex, route: currentRoute }
    const to = { path, index, route }

    currentPath = path
    currentIndex = index
    currentRoute = route

    if (!hasNavigated || !supportsViewTransitions()) return notify()

    const type = getTransitionType(to.index, from.index)
    if (!shouldTransition({ type, from, to })) return notify()

    const types = [type]

    if (supportsTransitionTypes()) {
      document.startViewTransition({ update: notify, types })
    } else {
      // Without `types` the browser falls back to its own cross-fade, which is
      // a reasonable way to change page when the slide is unavailable.
      document.startViewTransition(notify)
    }
  }

  /* The update callback of a view transition does not run synchronously: the
   * browser captures the old state first and calls it on a later task. Reading
   * the state here rather than in the subscription keeps a listener from
   * replaying whatever the store held when the transition started. */
  function notify() {
    const state = store.getState()
    // Copied, so that a listener subscribing during this pass waits for the
    // next one instead of being notified by the pass that added it.
    ;[...listeners].forEach((listener) => listener(state))
  }

  return store
}

/** `routes` as a predicate over a navigation. Without it every navigation
 * animates. */
function toPredicate(routes) {
  if (!routes) return () => true
  if (typeof routes === "function") return routes

  const names = new Set(routes)
  return ({ from, to }) => names.has(from.route) || names.has(to.route)
}

/** The path the router matches against. Hashes are deliberately excluded: they
 * change the fragment, not the page, so they must not animate one. */
function getPath() {
  return window.location.pathname + window.location.search
}

/** The position of the current entry in the session history, stamped by the
 * Router as it navigates. Comparing it to the previous one is what tells a push
 * from a traversal, and in which direction. */
function getIndex() {
  return window.history.state?.idx ?? 0
}

/** The route the Router entity resolved, whatever the entity is called. */
function getRoute(state) {
  return Object.values(state).find((entity) => entity?.type === "Router")?.route
}

function supportsViewTransitions() {
  return typeof document.startViewTransition === "function"
}

/**
 * @param {number} index - The index of the entry now current.
 * @param {number} previousIndex - The index of the entry before this render.
 * @returns {ViewTransitionType}
 */
function getTransitionType(index, previousIndex) {
  if (index < previousIndex) return "back"
  if (index > previousIndex) return "forward"
  return "replace"
}

/** `types` landed after `startViewTransition` itself, so an engine can have the
 * method and still throw when handed the object form of the argument. */
function supportsTransitionTypes() {
  return (
    typeof ViewTransition !== "undefined" && "types" in ViewTransition.prototype
  )
}
