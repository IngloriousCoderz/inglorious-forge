const GRANTED = "granted"
const DENIED = "denied"

/**
 * The type that measures how an app is used, and only once the user said
 * yes. Nothing reaches the adapter before then: in a browser, the first call
 * to an analytics library is what sets its cookies and sends its first hit.
 *
 * Its entity's `consent` is `"granted"`, `"denied"` or `null` (not asked
 * yet). Keep it between visits with `withStorage(["consent"])` from
 * `@inglorious/store/storage`. While `isAsking`, the app renders its own
 * consent prompt, whose answer is `analyticsConsent` with `true` or `false`.
 * `analyticsAsk` brings the prompt back, for a settings page where the
 * choice can be changed as easily as it was made.
 *
 * Once granted, every `routeChange` from the router is a page view, and the
 * app's own events go through `analyticsTrack` with `{ name, params }`.
 *
 * Everything vendor-specific is the `adapter`'s:
 *
 * - `setConsent(isGranted)`: starts or stops measuring.
 * - `pageView({ route, path })`: one page or screen. An adapter whose
 *   library already counts history changes as page views can do nothing.
 * - `event(name, params)`: one of the app's own events.
 *
 * @param {Object} config
 * @param {Object} config.adapter
 *
 * @example
 * const types = {
 *   Analytics: [createAnalytics({ adapter }), template, withStorage(["consent"])],
 * }
 * const entities = { analytics: { type: "Analytics" } }
 * // later, anywhere
 * api.notify("#analytics:analyticsTrack", { name: "sign_up" })
 */
export function createAnalytics({ adapter }) {
  return {
    create(entity) {
      entity.consent ??= null
      entity.isAsking ??= entity.consent === null
      if (entity.consent === GRANTED) call(() => adapter.setConsent(true))
    },

    routeChange(entity, { route, path } = {}) {
      if (entity.consent !== GRANTED) return
      call(() => adapter.pageView({ route, path }))
    },

    analyticsConsent(entity, isGranted, api) {
      const consent = isGranted ? GRANTED : DENIED
      entity.consent = consent
      entity.isAsking = false
      call(() => adapter.setConsent(isGranted))
      if (!isGranted) return

      const router = api.getEntity("router")
      if (router?.route) {
        call(() => adapter.pageView({ route: router.route, path: router.path }))
      }
    },

    analyticsAsk(entity) {
      entity.isAsking = true
    },

    analyticsTrack(entity, { name, params } = {}) {
      if (entity.consent !== GRANTED || !name) return
      call(() => adapter.event(name, params))
    },
  }
}

// Measuring is a courtesy: a failure, sync or async, never reaches the app.
function call(fn) {
  try {
    void Promise.resolve(fn()).catch(() => {})
  } catch {
    // Nothing to do: the next call tries again.
  }
}
