import { handleRequest } from "@inglorious/store/async"

const DEFAULT_ID = "auth"
const DEFAULT_METHODS = ["password"]
const DEFAULT_MIN_PASSWORD_LENGTH = 8
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CODE = /^\d{6,10}$/

/**
 * The type behind a sign-in screen: it walks from the email to a password, a
 * new account or a code sent by email, and holds the signed-in `user`. Codes
 * work everywhere, a native app included, since nobody has to open a link.
 *
 * `methods` lists what the screen offers: `"password"` (sign in, create an
 * account, confirm it with a code, reset a forgotten password) and `"code"`
 * (sign in with a code sent by email, creating the account on first use).
 *
 * The entity's `step` says what to ask for: `"email"`, `"password"`,
 * `"signUp"`, `"code"` or `"reset"`. `status` is `"loading"` while waiting,
 * then `"success"` or `"error"`, and `error` is a key: `"invalidEmail"`, `"invalidCode"`, `"weakPassword"`,
 * `"invalidCredentials"`, `"accountExists"`, `"rateLimited"`, `"captcha"`,
 * `"network"` or `"unknown"`.
 *
 * The `adapter` talks to the backend: `signIn`, `signUp`, `sendCode`,
 * `verifyCode`, `resendCode`, `sendResetCode`, `updatePassword`, `signOut`,
 * `eraseAccount`, `errorCode`, and optionally `accountExists`, which skips
 * straight to the password or the new account. `supabaseAuth` from
 * `@inglorious/supabase` is one.
 *
 * @param {Object} config
 * @param {Object} config.adapter
 * @param {("password" | "code")[]} [config.methods]
 * @param {number} [config.minPasswordLength] Defaults to 8.
 *
 * @example
 * const types = { Auth: [createAuth({ adapter: supabaseAuth(supabase) }), screen] }
 * watchAuth(supabaseAuth(supabase), store)
 */
export function createAuth({
  adapter,
  methods = DEFAULT_METHODS,
  minPasswordLength = DEFAULT_MIN_PASSWORD_LENGTH,
}) {
  const hasPassword = methods.includes("password")
  const hasCode = methods.includes("code")

  return {
    create(entity) {
      entity.user ??= null
      entity.isReady ??= false
      entity.methods = methods
      reset(entity)
    },

    sessionChange(entity, user) {
      entity.user = user ?? null
      entity.isReady = true
      if (user) reset(entity)
    },

    emailSubmit(entity, email, api) {
      const clean = String(email ?? "")
        .trim()
        .toLowerCase()
      entity.email = clean
      if (!EMAIL.test(clean)) {
        entity.error = "invalidEmail"
        return
      }
      entity.error = null
      if (hasPassword) {
        api.notify(`#${entity.id}:emailCheck`, clean)
        return
      }
      api.notify(`#${entity.id}:codeSend`, clean)
    },

    ...request("emailCheck", {
      async run(email) {
        return adapter.accountExists ? await adapter.accountExists(email) : true
      },
      success(entity, exists) {
        entity.step = exists ? "password" : "signUp"
      },
    }),

    signUpShow(entity) {
      entity.step = "signUp"
      entity.error = null
    },

    signInShow(entity) {
      entity.step = "password"
      entity.error = null
    },

    back(entity) {
      reset(entity, entity.email)
    },

    signInSubmit(entity, password, api) {
      api.notify(`#${entity.id}:signIn`, { email: entity.email, password })
    },

    ...request("signIn", {
      run: ({ email, password }) => adapter.signIn(email, password),
      success(entity, user) {
        entity.user = user
        reset(entity)
      },
      error(entity, code) {
        if (code !== "emailNotConfirmed") return
        entity.error = null
        showCode(entity, "signUp")
      },
    }),

    signUpSubmit(entity, { password, data } = {}, api) {
      if (String(password ?? "").length < minPasswordLength) {
        entity.error = "weakPassword"
        return
      }
      api.notify(`#${entity.id}:signUp`, {
        email: entity.email,
        password,
        data,
      })
    },

    ...request("signUp", {
      run: ({ email, password, data }) => adapter.signUp(email, password, data),
      success(entity, user) {
        if (user) {
          entity.user = user
          reset(entity)
          return
        }
        showCode(entity, "signUp")
      },
    }),

    codeRequest(entity, _, api) {
      if (!hasCode) return
      api.notify(`#${entity.id}:codeSend`, entity.email)
    },

    ...request("codeSend", {
      run: (email) => adapter.sendCode(email),
      success(entity) {
        showCode(entity, "signIn")
      },
    }),

    codeSubmit(entity, code, api) {
      const clean = String(code ?? "").trim()
      if (!CODE.test(clean)) {
        entity.error = "invalidCode"
        return
      }
      api.notify(`#${entity.id}:codeVerify`, {
        email: entity.email,
        code: clean,
        purpose: entity.codeFor,
      })
    },

    ...request("codeVerify", {
      run: ({ email, code, purpose }) =>
        adapter.verifyCode(email, code, purpose),
      success(entity, user) {
        entity.user = user
        reset(entity)
      },
    }),

    codeResend(entity, _, api) {
      api.notify(`#${entity.id}:resend`, {
        email: entity.email,
        purpose: entity.codeFor,
      })
    },

    ...request("resend", {
      run: ({ email, purpose }) => adapter.resendCode(email, purpose),
      success(entity) {
        entity.isCodeResent = true
      },
    }),

    resetRequest(entity, _, api) {
      if (!hasPassword) return
      api.notify(`#${entity.id}:resetSend`, entity.email)
    },

    ...request("resetSend", {
      run: (email) => adapter.sendResetCode(email),
      success(entity) {
        entity.step = "reset"
        entity.codeFor = "reset"
        entity.isCodeResent = false
      },
    }),

    resetSubmit(entity, { code, password } = {}, api) {
      const clean = String(code ?? "").trim()
      if (!CODE.test(clean)) {
        entity.error = "invalidCode"
        return
      }
      if (String(password ?? "").length < minPasswordLength) {
        entity.error = "weakPassword"
        return
      }
      api.notify(`#${entity.id}:passwordReset`, {
        email: entity.email,
        code: clean,
        password,
      })
    },

    ...request("passwordReset", {
      async run({ email, code, password }) {
        await adapter.verifyCode(email, code, "reset")
        return adapter.updatePassword(password)
      },
      success(entity, user) {
        entity.user = user
        reset(entity)
      },
    }),

    ...request("signOut", {
      run: () => adapter.signOut(),
      success(entity) {
        entity.user = null
        reset(entity)
      },
    }),

    accountEraseAsk(entity) {
      entity.isEraseAsked = true
    },

    accountEraseCancel(entity) {
      entity.isEraseAsked = false
    },

    ...request("accountErase", {
      run: () => adapter.eraseAccount(),
      success(entity) {
        entity.user = null
        reset(entity)
      },
    }),
  }

  function request(name, handlers) {
    return handleRequest(name, handlers, {
      toError: (error) => adapter.errorCode?.(error) ?? "unknown",
    })
  }
}

/**
 * Keeps the entity's `user` in step with the backend's session: signed in or
 * out, from this tab or another, and when a saved session is restored at
 * launch, which sets `isReady`.
 *
 * @param {{ onSessionChange: (listener: (user: object | null) => void) => () => void }} adapter
 * @param {{ notify: (type: string, payload?: unknown) => void }} store
 * @param {{ id?: string }} [options]
 * @returns {() => void} Stops watching.
 */
export function watchAuth(adapter, store, { id = DEFAULT_ID } = {}) {
  return adapter.onSessionChange((user) =>
    store.notify(`#${id}:sessionChange`, user),
  )
}

function reset(entity, email = "") {
  entity.step = "email"
  entity.email = email
  entity.codeFor = null
  entity.status = "idle"
  entity.error = null
  entity.isCodeResent = false
  entity.isEraseAsked = false
}

function showCode(entity, purpose) {
  entity.step = "code"
  entity.codeFor = purpose
  entity.isCodeResent = false
}
