const SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"

// Turnstile tokens last 300 seconds: a prepared one is dropped a little before.
const TOKEN_LIFETIME_MS = 270000

let loading = null

/** The Turnstile widget failed, or its script could not load. */
export class CaptchaError extends Error {
  /** @param {string} code Turnstile's error code, or what went wrong. */
  constructor(code) {
    super(`Captcha failed: ${code}`)
    this.name = "CaptchaError"
    this.code = code
  }
}

/**
 * Whether a call failed on the CAPTCHA: the widget's own `CaptchaError`, or
 * Supabase Auth refusing the token with `captcha_failed`.
 * @param {unknown} error
 * @returns {boolean}
 */
export function isCaptchaError(error) {
  return error instanceof CaptchaError || error?.code === "captcha_failed"
}

/**
 * Turnstile tokens for Supabase Auth's CAPTCHA protection. Without a site key,
 * as on a local stack, it does nothing and every token is `undefined`, which
 * Supabase Auth accepts while CAPTCHA protection is off.
 * @param {{ siteKey?: string, element: string | (() => Element | null), language?: string | (() => string) }} options
 *   `element` is where the widget goes, or its id; it only shows when Turnstile
 *   needs the person to act.
 */
export function createCaptcha({ siteKey, element, language = "auto" }) {
  let prepared = null

  async function render(action) {
    const turnstile = await loadTurnstile()
    const container =
      typeof element === "function"
        ? element()
        : document.getElementById(element)
    if (!container) throw new CaptchaError("missing-element")

    return new Promise((resolve, reject) => {
      const fail = (code) => () => {
        turnstile.remove(widgetId)
        reject(new CaptchaError(code))
        return true
      }
      const widgetId = turnstile.render(container, {
        sitekey: siteKey,
        action,
        appearance: "interaction-only",
        language: typeof language === "function" ? language() : language,
        callback(token) {
          turnstile.remove(widgetId)
          resolve(token)
        },
        "error-callback": (code) => fail(String(code))(),
        "expired-callback": fail("expired"),
        "timeout-callback": fail("timeout"),
        "unsupported-callback": fail("unsupported"),
      })
    })
  }

  return {
    /**
     * Starts solving the challenge, so that `token(action)` needn't wait.
     * Call it when the form shows, such as once the email is known.
     * @param {string} action
     */
    prepare(action) {
      if (!siteKey) return
      const token = render(action)
      token.catch(() => null)
      prepared = { action, token, at: Date.now() }
    },

    /**
     * A token for one Supabase Auth call, as `options.captchaToken`. A token
     * works once: a prepared one is used at most once, then a new one is made.
     * @param {string} action
     * @returns {Promise<string | undefined>}
     */
    async token(action) {
      if (!siteKey) return undefined
      const ready = prepared
      prepared = null
      if (
        ready?.action === action &&
        Date.now() - ready.at < TOKEN_LIFETIME_MS
      ) {
        const token = await ready.token.catch(() => null)
        if (token) return token
      }
      return render(action)
    },
  }
}

function loadTurnstile() {
  if (globalThis.turnstile) return Promise.resolve(globalThis.turnstile)
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => resolve(globalThis.turnstile)
    script.onerror = () => {
      loading = null
      script.remove()
      reject(new CaptchaError("script-failed"))
    }
    document.head.append(script)
  })
  return loading
}
