import { isCaptchaError } from "../captcha/index.js"
import { isNetworkError } from "../errors/index.js"

const DEFAULT_ERASE_FUNCTION = "erase-account"
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
 * @param {string} [options.eraseFunction] Defaults to `"erase-account"`.
 */
export function supabaseAuth(
  client,
  {
    captcha,
    accountExistsFunction,
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
          shouldCreateUser: true,
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
      const { data } = auth.onAuthStateChange(() => {
        setTimeout(async () => {
          if (isStopped) return
          const { data: current } = await auth.getSession()
          if (!isStopped) listener(current.session?.user ?? null)
        })
      })
      return () => {
        isStopped = true
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
