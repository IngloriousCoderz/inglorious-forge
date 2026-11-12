import { createStore } from "@inglorious/store"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { createAuth, watchAuth } from "./index.js"

const USER = { id: "u1", email: "ada@example.com" }
const EMAIL = "ada@example.com"
const PASSWORD = "correct horse"
const CODE = "123456"

let adapter

beforeEach(() => {
  adapter = {
    signIn: vi.fn(async () => USER),
    signUp: vi.fn(async () => null),
    sendCode: vi.fn(async () => {}),
    verifyCode: vi.fn(async () => USER),
    verifyLink: vi.fn(async () => USER),
    resendCode: vi.fn(async () => {}),
    sendResetCode: vi.fn(async () => {}),
    updatePassword: vi.fn(async () => USER),
    signOut: vi.fn(async () => {}),
    eraseAccount: vi.fn(async () => {}),
    errorCode: (error) => error.code ?? "unknown",
  }
})

// Records each sign-in, as an app's own `signedIn` handler would.
const recordSignIns = {
  signedIn(entity, { user, isNew }) {
    entity.signIns = [...(entity.signIns ?? []), { id: user.id, isNew }]
  },
}

function storeWith(options = {}) {
  return createStore({
    types: { Auth: [createAuth({ adapter, ...options }), recordSignIns] },
    entities: { auth: { type: "Auth" } },
  })
}

async function send(store, event, payload) {
  store.notify(`#auth:${event}`, payload)
  await settle()
}

function settle() {
  return new Promise((resolve) => setTimeout(resolve))
}

const auth = (store) => store.getEntity("auth")

function rejecting(code) {
  return vi.fn(async () => {
    throw Object.assign(new Error(code), { code })
  })
}

describe("createAuth", () => {
  it("starts signed out, asking for the email, until the session is known", async () => {
    const store = storeWith()

    expect(auth(store)).toMatchObject({
      user: null,
      isReady: false,
      step: "email",
      methods: ["password"],
    })

    await send(store, "sessionChange", USER)
    expect(auth(store)).toMatchObject({ user: USER, isReady: true })
  })

  it("refuses an email that isn't one", async () => {
    const store = storeWith()

    await send(store, "emailSubmit", "ada")

    expect(auth(store)).toMatchObject({ step: "email", error: "invalidEmail" })
  })

  it("signs in with a password", async () => {
    const store = storeWith()

    await send(store, "emailSubmit", " Ada@Example.com ")
    expect(auth(store)).toMatchObject({ step: "password", email: EMAIL })

    await send(store, "signInSubmit", PASSWORD)

    expect(adapter.signIn).toHaveBeenCalledWith(EMAIL, PASSWORD)
    expect(auth(store)).toMatchObject({ user: USER, step: "email", email: "" })
  })

  it("asks for a new account when the backend knows no such email", async () => {
    adapter.accountExists = vi.fn(async () => false)
    const store = storeWith()

    await send(store, "emailSubmit", EMAIL)

    expect(auth(store).step).toBe("signUp")
  })

  it("says why a sign-in failed, and stops waiting", async () => {
    adapter.signIn = rejecting("invalidCredentials")
    const store = storeWith()
    await send(store, "emailSubmit", EMAIL)

    await send(store, "signInSubmit", "wrong")

    expect(auth(store)).toMatchObject({
      status: "error",
      error: "invalidCredentials",
      step: "password",
    })
  })

  it("asks for the confirmation code of an account not confirmed yet", async () => {
    adapter.signIn = rejecting("emailNotConfirmed")
    const store = storeWith()
    await send(store, "emailSubmit", EMAIL)

    await send(store, "signInSubmit", PASSWORD)

    expect(auth(store)).toMatchObject({
      step: "code",
      codeFor: "signUp",
      error: null,
    })
  })

  it("creates an account and confirms it with a code", async () => {
    const store = storeWith()
    await send(store, "emailSubmit", EMAIL)
    await send(store, "signUpShow")

    await send(store, "signUpSubmit", { password: "short" })
    expect(auth(store).error).toBe("weakPassword")

    await send(store, "signUpSubmit", {
      password: PASSWORD,
      data: { name: "Ada" },
    })
    expect(adapter.signUp).toHaveBeenCalledWith(EMAIL, PASSWORD, {
      name: "Ada",
    })
    expect(auth(store)).toMatchObject({ step: "code", codeFor: "signUp" })

    await send(store, "codeSubmit", "12")
    expect(auth(store).error).toBe("invalidCode")

    await send(store, "codeSubmit", ` ${CODE} `)
    expect(adapter.verifyCode).toHaveBeenCalledWith(EMAIL, CODE, "signUp")
    expect(auth(store).user).toEqual(USER)
  })

  it("signs in at once when the backend needs no confirmation", async () => {
    adapter.signUp = vi.fn(async () => USER)
    const store = storeWith()
    await send(store, "emailSubmit", EMAIL)
    await send(store, "signUpShow")

    await send(store, "signUpSubmit", { password: PASSWORD })

    expect(auth(store).user).toEqual(USER)
  })

  it("signs in with a code alone", async () => {
    const store = storeWith({ methods: ["code"] })

    await send(store, "emailSubmit", EMAIL)
    expect(adapter.sendCode).toHaveBeenCalledWith(EMAIL)
    expect(auth(store)).toMatchObject({ step: "code", codeFor: "signIn" })

    await send(store, "codeResend")
    expect(adapter.resendCode).toHaveBeenCalledWith(EMAIL, "signIn")
    expect(auth(store).isCodeResent).toBe(true)

    await send(store, "codeSubmit", CODE)
    expect(adapter.verifyCode).toHaveBeenCalledWith(EMAIL, CODE, "signIn")
    expect(auth(store).user).toEqual(USER)
  })

  it("offers a code instead of the password when both are on", async () => {
    const store = storeWith({ methods: ["password", "code"] })
    await send(store, "emailSubmit", EMAIL)

    await send(store, "codeRequest")

    expect(auth(store)).toMatchObject({ step: "code", codeFor: "signIn" })
  })

  it("resets a forgotten password with a code", async () => {
    const store = storeWith()
    await send(store, "emailSubmit", EMAIL)

    await send(store, "resetRequest")
    expect(adapter.sendResetCode).toHaveBeenCalledWith(EMAIL)
    expect(auth(store)).toMatchObject({ step: "reset", codeFor: "reset" })

    await send(store, "resetSubmit", { code: CODE, password: "short" })
    expect(auth(store).error).toBe("weakPassword")

    await send(store, "resetSubmit", { code: CODE, password: PASSWORD })
    expect(adapter.verifyCode).toHaveBeenCalledWith(EMAIL, CODE, "reset")
    expect(adapter.updatePassword).toHaveBeenCalledWith(PASSWORD)
    expect(auth(store).user).toEqual(USER)
  })

  it("goes back to the email, keeping it", async () => {
    const store = storeWith()
    await send(store, "emailSubmit", EMAIL)

    await send(store, "back")

    expect(auth(store)).toMatchObject({ step: "email", email: EMAIL })
  })

  it("signs out", async () => {
    const store = storeWith()
    await send(store, "sessionChange", USER)

    await send(store, "signOut")

    expect(adapter.signOut).toHaveBeenCalled()
    expect(auth(store).user).toBeNull()
  })

  it("erases the account once asked and confirmed", async () => {
    const store = storeWith()
    await send(store, "sessionChange", USER)

    await send(store, "accountEraseAsk")
    expect(auth(store).isEraseAsked).toBe(true)
    await send(store, "accountEraseCancel")
    expect(auth(store).isEraseAsked).toBe(false)

    await send(store, "accountErase")
    expect(adapter.eraseAccount).toHaveBeenCalled()
    expect(auth(store)).toMatchObject({ user: null, isEraseAsked: false })
  })

  it("keeps the account when erasing fails, and says so", async () => {
    adapter.eraseAccount = rejecting("network")
    const store = storeWith()
    await send(store, "sessionChange", USER)

    await send(store, "accountErase")

    expect(auth(store)).toMatchObject({ user: USER, error: "network" })
  })
})

describe("createAuth signing in", () => {
  it("tells the app who signed in, and whether the account is new", async () => {
    const store = storeWith({ methods: ["password", "code"] })
    await send(store, "emailSubmit", EMAIL)
    await send(store, "signInSubmit", PASSWORD)
    await send(store, "emailSubmit", EMAIL)
    await send(store, "signUpShow")
    await send(store, "signUpSubmit", { password: PASSWORD })
    await send(store, "codeSubmit", CODE)

    expect(auth(store).signIns).toEqual([
      { id: USER.id, isNew: false },
      { id: USER.id, isNew: true },
    ])
  })

  it("signs in with the link of a confirmation email", async () => {
    const store = storeWith()

    await send(store, "linkSubmit", { tokenHash: "hash" })

    expect(adapter.verifyLink).toHaveBeenCalledWith("hash", "signUp")
    expect(auth(store)).toMatchObject({
      user: USER,
      signIns: [{ id: USER.id, isNew: true }],
    })
  })

  it("prepares the next step as soon as it is known", async () => {
    adapter.prepare = vi.fn()
    adapter.accountExists = vi.fn(async () => false)
    const store = storeWith()

    await send(store, "emailSubmit", EMAIL)

    expect(adapter.prepare).toHaveBeenCalledWith("signUp")
  })
})

describe("watchAuth", () => {
  it("follows the backend's session", () => {
    let listener
    const stop = vi.fn()
    const store = { notify: vi.fn() }

    const unwatch = watchAuth(
      {
        onSessionChange: (callback) => {
          listener = callback
          return stop
        },
      },
      store,
    )
    listener(USER)
    unwatch()

    expect(store.notify).toHaveBeenCalledWith("#auth:sessionChange", USER)
    expect(stop).toHaveBeenCalled()
  })
})
