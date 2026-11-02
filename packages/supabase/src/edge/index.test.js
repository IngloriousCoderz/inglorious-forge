import { afterEach, describe, expect, it, vi } from "vitest"

import {
  bearerToken,
  callerRole,
  currentUser,
  EmailError,
  env,
  handle,
  isLocalStack,
  json,
  sendEmails,
  upstreamError,
} from "./index.js"

function request(headers = {}, method = "POST") {
  return new Request("https://example.supabase.co/functions/v1/f", {
    method,
    headers,
  })
}

function jwt(payload) {
  const encode = (value) =>
    btoa(JSON.stringify(value))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")
  return `${encode({ alg: "HS256" })}.${encode(payload)}.signature`
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("edge helpers", () => {
  it("reads a required environment variable", () => {
    vi.stubGlobal("Deno", { env: { get: (name) => ({ KEY: "v" })[name] } })

    expect(env("KEY")).toBe("v")
    expect(() => env("MISSING")).toThrow("MISSING is not set")
  })

  it("answers JSON with CORS headers", async () => {
    const res = json({ ok: true }, 201, { "Cache-Control": "no-store" })

    expect(res.status).toBe(201)
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*")
    expect(res.headers.get("Cache-Control")).toBe("no-store")
    expect(await res.json()).toEqual({ ok: true })
  })

  it("answers the preflight and turns a thrown error into JSON", async () => {
    const handler = handle(
      async () => {
        throw new Error("Boom")
      },
      { fallbackError: "Failed" },
    )

    const preflight = await handler(request({}, "OPTIONS"))
    expect(preflight.headers.get("Access-Control-Allow-Methods")).toContain(
      "POST",
    )

    const res = await handler(request())
    expect(res.status).toBe(500)
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*")
    expect(await res.json()).toEqual({ error: "Boom" })

    const silent = handle(async () => {
      throw "nothing useful"
    })
    expect(await (await silent(request())).json()).toEqual({
      error: "Unexpected error",
    })
  })

  it("describes a failed upstream call with the start of its body", async () => {
    const error = await upstreamError(
      "Deepgram",
      new Response("x".repeat(300), { status: 402 }),
    )

    expect(error.message).toBe(`Deepgram 402: ${"x".repeat(200)}`)
  })

  it("reads the bearer token and its role", () => {
    const token = jwt({ role: "service_role", sub: "1" })
    const req = request({ Authorization: `Bearer ${token}` })

    expect(bearerToken(req)).toBe(token)
    expect(callerRole(req)).toBe("service_role")
    expect(callerRole(request())).toBeNull()
    expect(callerRole(request({ Authorization: "Bearer junk" }))).toBeNull()
  })

  it("asks the client who the token belongs to, never trusting the body", async () => {
    const getUser = vi.fn(async () => ({ data: { user: { id: "u1" } } }))
    const client = { auth: { getUser } }

    expect(
      await currentUser(client, request({ Authorization: "Bearer t" })),
    ).toEqual({ id: "u1" })
    expect(getUser).toHaveBeenCalledWith("t")
    expect(await currentUser(client, request())).toBeNull()
  })

  it("recognizes the local stack", () => {
    expect(isLocalStack("http://kong:8000")).toBe(true)
    expect(isLocalStack("http://127.0.0.1:54321")).toBe(true)
    expect(isLocalStack("https://abc.supabase.co")).toBe(false)
  })
})

describe("sendEmails", () => {
  const options = { apiKey: "re_key", from: "App <hi@app.dev>" }

  it("sends a batch in one request, each from the sender", async () => {
    const fetch = vi.fn(async () => new Response("{}"))
    vi.stubGlobal("fetch", fetch)

    await sendEmails(
      [
        { to: "a@x.dev", subject: "A", text: "a" },
        { to: "b@x.dev", subject: "B", text: "b" },
      ],
      options,
    )

    const [url, init] = fetch.mock.calls[0]
    expect(url).toBe("https://api.resend.com/emails/batch")
    expect(init.headers.Authorization).toBe("Bearer re_key")
    expect(JSON.parse(init.body).map((email) => email.from)).toEqual([
      options.from,
      options.from,
    ])
  })

  it("sends nothing for no emails", async () => {
    const fetch = vi.fn()
    vi.stubGlobal("fetch", fetch)

    await sendEmails([], options)

    expect(fetch).not.toHaveBeenCalled()
  })

  it("throws an EmailError with Resend's status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("daily quota", { status: 429 })),
    )

    const error = await sendEmails(
      [{ to: "a@x.dev", subject: "A", text: "a" }],
      options,
    ).catch((err) => err)

    expect(error).toBeInstanceOf(EmailError)
    expect(error.status).toBe(429)
  })
})
