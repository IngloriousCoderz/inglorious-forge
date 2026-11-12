import { describe, expect, it, vi } from "vitest"

import { CaptchaError } from "../captcha/index.js"
import { supabaseAuth } from "./index.js"

const USER = { id: "u1", email: "ada@example.com" }
const EMAIL = "ada@example.com"

function fakeClient() {
  const ok = (data = {}) => vi.fn(async () => ({ data, error: null }))
  return {
    auth: {
      onAuthStateChange: vi.fn(),
      signInWithPassword: ok({ user: USER }),
      signUp: ok({ user: USER, session: null }),
      signInWithOtp: ok(),
      verifyOtp: ok({ user: USER }),
      resend: ok(),
      resetPasswordForEmail: ok(),
      updateUser: ok({ user: USER }),
      signOut: ok(),
    },
    functions: { invoke: ok({ exists: true }) },
  }
}

describe("supabaseAuth", () => {
  it("reports the current session's user after each event, and stops", async () => {
    const client = fakeClient()
    const unsubscribe = vi.fn()
    let emit
    client.auth.onAuthStateChange.mockImplementation((callback) => {
      emit = callback
      return { data: { subscription: { unsubscribe } } }
    })
    client.auth.getSession = vi
      .fn(async () => ({ data: { session: null } }))
      .mockResolvedValueOnce({ data: { session: { user: USER } } })
      .mockResolvedValueOnce({ data: { session: null } })
    const listener = vi.fn()
    const settle = () => new Promise((resolve) => setTimeout(resolve))

    const stop = supabaseAuth(client).onSessionChange(listener)
    emit("SIGNED_IN", { user: USER })
    await settle()
    emit("USER_UPDATED", { user: USER })
    await settle()
    stop()
    emit("SIGNED_IN", { user: USER })
    await settle()

    expect(listener.mock.calls).toEqual([[USER], [null]])
    expect(unsubscribe).toHaveBeenCalled()
  })

  it("passes a CAPTCHA token with every call that sends email or signs in", async () => {
    const client = fakeClient()
    const captcha = { token: vi.fn(async (action) => `token-${action}`) }
    const auth = supabaseAuth(client, { captcha })

    await auth.signIn(EMAIL, "pw")
    await auth.sendCode(EMAIL)

    expect(client.auth.signInWithPassword).toHaveBeenCalledWith({
      email: EMAIL,
      password: "pw",
      options: { captchaToken: "token-signIn" },
    })
    expect(client.auth.signInWithOtp).toHaveBeenCalledWith({
      email: EMAIL,
      options: { shouldCreateUser: true, captchaToken: "token-sendCode" },
    })
  })

  it("signs up, signed in only when no confirmation is needed", async () => {
    const client = fakeClient()
    const auth = supabaseAuth(client)

    expect(await auth.signUp(EMAIL, "pw", { name: "Ada" })).toBeNull()
    expect(client.auth.signUp).toHaveBeenCalledWith({
      email: EMAIL,
      password: "pw",
      options: { data: { name: "Ada" }, captchaToken: undefined },
    })

    client.auth.signUp = vi.fn(async () => ({
      data: { user: USER, session: {} },
      error: null,
    }))
    expect(await auth.signUp(EMAIL, "pw")).toEqual(USER)
  })

  it("verifies each kind of code", async () => {
    const client = fakeClient()
    const auth = supabaseAuth(client)

    await auth.verifyCode(EMAIL, "123456", "signUp")
    await auth.verifyCode(EMAIL, "123456", "reset")

    expect(client.auth.verifyOtp.mock.calls).toEqual([
      [{ email: EMAIL, token: "123456", type: "email" }],
      [{ email: EMAIL, token: "123456", type: "recovery" }],
    ])
  })

  it("sends each kind of code again", async () => {
    const client = fakeClient()
    const auth = supabaseAuth(client)

    await auth.resendCode(EMAIL, "signUp")
    await auth.resendCode(EMAIL, "signIn")
    await auth.resendCode(EMAIL, "reset")

    expect(client.auth.resend).toHaveBeenCalledWith({
      type: "signup",
      email: EMAIL,
      options: { captchaToken: undefined },
    })
    expect(client.auth.signInWithOtp).toHaveBeenCalled()
    expect(client.auth.resetPasswordForEmail).toHaveBeenCalledWith(EMAIL, {
      captchaToken: undefined,
    })
  })

  it("asks an Edge Function whether an account exists, when given one", async () => {
    const client = fakeClient()

    expect(supabaseAuth(client).accountExists).toBeUndefined()
    const auth = supabaseAuth(client, { accountExistsFunction: "check-email" })

    expect(await auth.accountExists(EMAIL)).toBe(true)
    expect(client.functions.invoke).toHaveBeenCalledWith("check-email", {
      body: { email: EMAIL },
    })
  })

  it("erases the account through its Edge Function, then signs out here", async () => {
    const client = fakeClient()

    await supabaseAuth(client).eraseAccount()

    expect(client.functions.invoke).toHaveBeenCalledWith("erase-account", {
      method: "POST",
    })
    expect(client.auth.signOut).toHaveBeenCalledWith({ scope: "local" })
  })

  it("keeps the session when erasing fails", async () => {
    const client = fakeClient()
    client.functions.invoke = vi.fn(async () => ({
      data: null,
      error: new Error("down"),
    }))

    await expect(supabaseAuth(client).eraseAccount()).rejects.toThrow("down")
    expect(client.auth.signOut).not.toHaveBeenCalled()
  })

  it("throws Supabase's errors and names them", async () => {
    const client = fakeClient()
    const refused = Object.assign(new Error("no"), {
      code: "invalid_credentials",
    })
    client.auth.signInWithPassword = vi.fn(async () => ({
      data: {},
      error: refused,
    }))
    const auth = supabaseAuth(client)

    await expect(auth.signIn(EMAIL, "pw")).rejects.toBe(refused)
    expect(auth.errorCode(refused)).toBe("invalidCredentials")
    expect(auth.errorCode({ code: "otp_expired" })).toBe("invalidCode")
    expect(auth.errorCode({ code: "captcha_failed" })).toBe("captcha")
    expect(auth.errorCode(new CaptchaError("timeout"))).toBe("captcha")
    expect(auth.errorCode({ name: "AuthRetryableFetchError" })).toBe("network")
    expect(auth.errorCode({ code: "mystery" })).toBe("unknown")
  })
})
