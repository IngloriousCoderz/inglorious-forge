import { isCaptchaError } from "../captcha/index.js"
import { isNetworkError } from "../errors/index.js"

const DEFAULT_ERASE_FUNCTION = "erase-account"
const FIRST_RETRY_MS = 500
const MAX_RETRY_MS = 30_000
const RETRY_BACKOFF = 2
const NOW = 0
// What Supabase Auth answers for a session whose account or session no
// longer exists, as opposed to a network failure.
const GONE_CODES = new Set(["user_not_found", "session_not_found"])
const ERROR_CODES = {
  invalid_credentials: "invalidCredentials",
  email_not_confirmed: "emailNotConfirmed",
  weak_password: "weakPassword",
  otp_expired: "invalidCode",
  otp_disabled: "invalidCode",
  user_already_exists: "accountExists",
  email_exists: "accountExists",
  email_address_invalid: "invalidEmail",
  over_email_send_rate_limit: "rateLimited",
  over_request_rate_limit: "rateLimited",
}

/**
 * The adapter of `createAuth` from `@inglorious/web/auth`, over Supabase
 * Auth. Codes come from the email templates' `{{ .Token }}`: a confirmation
 * code for a new account, a sign-in code, a reset code. Erasing an account
 * calls the Edge Function `eraseFunction`, which `eraseUser` from
 * `@inglorious/supabase/edge` makes short.
 *
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @param {Object} [options]
 * @param {import("../../types/index.d.ts").Captcha} [options.captcha] For
 *   Supabase Auth's CAPTCHA protection, from `createCaptcha`.
 * @param {string} [options.accountExistsFunction] An Edge Function that
 *   answers `{ exists }` for `{ email }`, to skip straight to the password or
 *   the new account. Without it, the screen asks for the password and offers
 *   to create an account.
 * @param {boolean} [options.codeCreatesAccount] Defaults to `true`: a sign-in
 *   code sent to an unknown email creates the account. `false` leaves that to
 *   sign-up.
 * @param {string} [options.eraseFunction] Defaults to `"erase-account"`.
 */
export function supabaseAuth(
  client,
  {
    captcha,
    accountExistsFunction,
    codeCreatesAccount = true,
    eraseFunction = DEFAULT_ERASE_FUNCTION,
  } = {},
) {
  const auth = client.auth
  const captchaToken = (action) => captcha?.token(action)

  async function sendCode(email) {
    await check(
      auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: codeCreatesAccount,
          captchaToken: await captchaToken("sendCode"),
        },
      }),
    )
  }

  async function sendResetCode(email) {
    await check(
      auth.resetPasswordForEmail(email, {
        captchaToken: await captchaToken("reset"),
      }),
    )
  }

  return {
    // Reads the session after each event rather than trusting the event's:
    // a late USER_UPDATED can arrive after SIGNED_OUT with the old session.
    // Deferred, since Supabase locks up on auth calls inside the callback.
    onSessionChange(listener) {
      let isStopped = false
      // A session restored at launch is only read from storage: its account
      // may have been erased since, from another device or by a reset
      // backend. Before a session's user is first reported, the server is
      // asked, once per access token (so about once an hour); offline, the
      // session stays.
      let verified
      // A session that can't be read, as when the Keychain or Keystore fails
      // while the app starts, is neither signed in nor out: nothing is
      // reported, and the read is tried again, later each time. A newer
      // event takes over from a pending retry.
      let timer
      let retryMs = FIRST_RETRY_MS

      function schedule(delayMs) {
        clearTimeout(timer)
        timer = setTimeout(report, delayMs)
      }

      async function report() {
        if (isStopped) return
        let user
        try {
          user = await currentUser()
        } catch {
          if (isStopped) return
          schedule(retryMs)
          retryMs = Math.min(retryMs * RETRY_BACKOFF, MAX_RETRY_MS)
          return
        }
        retryMs = FIRST_RETRY_MS
        if (!isStopped) listener(user)
      }

      async function currentUser() {
        // Only a read that throws is retried. An error answered, as for an
        // expired token offline, has no session to report: the next refresh
        // brings it back with its own event.
        const { data: current } = await auth.getSession()
        const user = current.session?.user ?? null
        if (!user) return null
        const token = current.session.access_token
        if (!verified || verified.token !== token) {
          verified = { token, isGone: isGone(auth) }
        }
        if (!(await verified.isGone)) return user
        await auth.signOut({ scope: "local" })
        return null
      }

      const { data } = auth.onAuthStateChange(() => schedule(NOW))
      return () => {
        isStopped = true
        clearTimeout(timer)
        data.subscription.unsubscribe()
      }
    },

    ...(accountExistsFunction && {
      async accountExists(email) {
        const { data, error } = await client.functions.invoke(
          accountExistsFunction,
          { body: { email } },
        )
        if (error) throw error
        return Boolean(data.exists)
      },
    }),

    async signIn(email, password) {
      const { data } = await check(
        auth.signInWithPassword({
          email,
          password,
          options: { captchaToken: await captchaToken("signIn") },
        }),
      )
      return data.user
    },

    async signUp(email, password, data) {
      const result = await check(
        auth.signUp({
          email,
          password,
          options: { data, captchaToken: await captchaToken("signUp") },
        }),
      )
      return result.data.session ? result.data.user : null
    },

    sendCode,

    async verifyCode(email, code, purpose) {
      const { data } = await check(
        auth.verifyOtp({
          email,
          token: code,
          type: purpose === "reset" ? "recovery" : "email",
        }),
      )
      return data.user
    },

    async verifyLink(tokenHash, purpose) {
      const { data } = await check(
        auth.verifyOtp({
          token_hash: tokenHash,
          type: purpose === "reset" ? "recovery" : "email",
        }),
      )
      return data.user
    },

    prepare(action) {
      captcha?.prepare(action)
    },

    async resendCode(email, purpose) {
      if (purpose === "signIn") return sendCode(email)
      if (purpose === "reset") return sendResetCode(email)
      await check(
        auth.resend({
          type: "signup",
          email,
          options: { captchaToken: await captchaToken("resend") },
        }),
      )
    },

    sendResetCode,

    async updatePassword(password) {
      const { data } = await check(auth.updateUser({ password }))
      return data.user
    },

    async signOut() {
      await check(auth.signOut())
    },

    async eraseAccount() {
      const { error } = await client.functions.invoke(eraseFunction, {
        method: "POST",
      })
      if (error) throw error
      await auth.signOut({ scope: "local" })
    },

    errorCode(error) {
      if (isNetworkError(error)) return "network"
      if (isCaptchaError(error)) return "captcha"
      return ERROR_CODES[error?.code] ?? "unknown"
    },
  }
}

async function check(call) {
  const result = await call
  if (result.error) throw result.error
  return result
}

// Only the server's word counts: a check that fails before it answers, like
// one offline, leaves the session be.
async function isGone(auth) {
  try {
    const { error } = await auth.getUser()
    return GONE_CODES.has(error?.code)
  } catch {
    return false
  }
}
