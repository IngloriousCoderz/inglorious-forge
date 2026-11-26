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
      getUser: ok({ user: USER }),
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

  describe("a session restored at launch", () => {
    async function restore(getUserAnswer) {
      const client = fakeClient()
      let emit
      client.auth.onAuthStateChange.mockImplementation((callback) => {
        emit = callback
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })
      client.auth.getSession = vi.fn(async () => ({
        data: { session: { user: USER } },
      }))
      client.auth.getUser = vi.fn(async () => getUserAnswer)
      const listener = vi.fn()

      supabaseAuth(client).onSessionChange(listener)
      // supabase-js announces a restored session as SIGNED_IN, then
      // INITIAL_SESSION: neither may report a user that is gone.
      emit("SIGNED_IN", { user: USER })
      emit("INITIAL_SESSION", { user: USER })
      await new Promise((resolve) => setTimeout(resolve))
      await new Promise((resolve) => setTimeout(resolve))
      return { client, listener }
    }

    it("signs out when its account no longer exists", async () => {
      const { client, listener } = await restore({
        data: { user: null },
        error: { code: "user_not_found", status: 403 },
      })

      expect(client.auth.signOut).toHaveBeenCalledWith({ scope: "local" })
      expect(client.auth.getUser).toHaveBeenCalledTimes(1)
      expect(listener).not.toHaveBeenCalledWith(USER)
      expect(listener).toHaveBeenCalledWith(null)
    })

    it("keeps a valid one", async () => {
      const { client, listener } = await restore({
        data: { user: USER },
        error: null,
      })

      expect(client.auth.signOut).not.toHaveBeenCalled()
      expect(listener).toHaveBeenCalledWith(USER)
    })

    it("keeps it offline, when the server can't answer", async () => {
      const { client, listener } = await restore({
        data: { user: null },
        error: { name: "AuthRetryableFetchError", status: 0 },
      })

      expect(client.auth.signOut).not.toHaveBeenCalled()
      expect(listener).toHaveBeenCalledWith(USER)
    })

    it("keeps it when the check fails before the server answers", async () => {
      const client = fakeClient()
      let emit
      client.auth.onAuthStateChange.mockImplementation((callback) => {
        emit = callback
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })
      client.auth.getSession = vi.fn(async () => ({
        data: { session: { user: USER, access_token: "t1" } },
      }))
      client.auth.getUser = vi.fn(async () => {
        throw new Error("Failed to get data")
      })
      const listener = vi.fn()

      supabaseAuth(client).onSessionChange(listener)
      emit("INITIAL_SESSION", { user: USER })
      await new Promise((resolve) => setTimeout(resolve))
      await new Promise((resolve) => setTimeout(resolve))

      expect(client.auth.signOut).not.toHaveBeenCalled()
      expect(listener).toHaveBeenCalledWith(USER)
    })
  })

  describe("a session that can't be read", () => {
    function unreadable() {
      const client = fakeClient()
      let emit
      client.auth.onAuthStateChange.mockImplementation((callback) => {
        emit = callback
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })
      client.auth.getSession = vi
        .fn(async () => ({
          data: { session: { user: USER, access_token: "t1" } },
          error: null,
        }))
        .mockRejectedValueOnce(new Error("Failed to get data"))
        .mockRejectedValueOnce(new Error("Failed to get data"))
      const listener = vi.fn()
      const stop = supabaseAuth(client).onSessionChange(listener)
      return { client, emit, listener, stop }
    }

    it("reports nothing until a later read succeeds", async () => {
      vi.useFakeTimers()
      try {
        const { client, emit, listener } = unreadable()

        emit("INITIAL_SESSION", null)
        await vi.advanceTimersByTimeAsync(0)
        expect(listener).not.toHaveBeenCalled()

        await vi.advanceTimersByTimeAsync(500)
        expect(listener).not.toHaveBeenCalled()

        await vi.advanceTimersByTimeAsync(1000)
        expect(client.auth.getSession).toHaveBeenCalledTimes(3)
        expect(client.auth.signOut).not.toHaveBeenCalled()
        expect(listener.mock.calls).toEqual([[USER]])
      } finally {
        vi.useRealTimers()
      }
    })

    it("reports no one, without retrying, for a session it answers with an error", async () => {
      vi.useFakeTimers()
      try {
        const client = fakeClient()
        let emit
        client.auth.onAuthStateChange.mockImplementation((callback) => {
          emit = callback
          return { data: { subscription: { unsubscribe: vi.fn() } } }
        })
        client.auth.getSession = vi.fn(async () => ({
          data: { session: null },
          error: { name: "AuthRetryableFetchError", status: 0 },
        }))
        const listener = vi.fn()
        supabaseAuth(client).onSessionChange(listener)

        emit("INITIAL_SESSION", null)
        await vi.advanceTimersByTimeAsync(60_000)

        expect(client.auth.getSession).toHaveBeenCalledTimes(1)
        expect(client.auth.signOut).not.toHaveBeenCalled()
        expect(listener.mock.calls).toEqual([[null]])
      } finally {
        vi.useRealTimers()
      }
    })

    it("stops retrying once stopped", async () => {
      vi.useFakeTimers()
      try {
        const { client, emit, listener, stop } = unreadable()

        emit("INITIAL_SESSION", null)
        await vi.advanceTimersByTimeAsync(0)
        stop()
        await vi.advanceTimersByTimeAsync(60_000)

        expect(client.auth.getSession).toHaveBeenCalledTimes(1)
        expect(listener).not.toHaveBeenCalled()
      } finally {
        vi.useRealTimers()
      }
    })
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

  it("sends sign-in codes that create no account when told", async () => {
    const client = fakeClient()
    const auth = supabaseAuth(client, { codeCreatesAccount: false })

    await auth.sendCode(EMAIL)
    await auth.resendCode(EMAIL, "signIn")

    expect(client.auth.signInWithOtp).toHaveBeenCalledTimes(2)
    expect(client.auth.signInWithOtp).toHaveBeenLastCalledWith({
      email: EMAIL,
      options: { shouldCreateUser: false, captchaToken: undefined },
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

  it("signs in with the link of an email", async () => {
    const client = fakeClient()

    expect(await supabaseAuth(client).verifyLink("hash", "signUp")).toEqual(
      USER,
    )
    expect(client.auth.verifyOtp).toHaveBeenCalledWith({
      token_hash: "hash",
      type: "email",
    })
  })

  it("starts the CAPTCHA of the next step early", () => {
    const captcha = { prepare: vi.fn(), token: vi.fn() }

    supabaseAuth(fakeClient(), { captcha }).prepare("signUp")
    supabaseAuth(fakeClient()).prepare("signIn")

    expect(captcha.prepare).toHaveBeenCalledWith("signUp")
  })
})
