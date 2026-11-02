/**
 * Helpers for Supabase Edge Functions, which run on Deno. Nothing here imports
 * supabase-js: functions that need a client pass their own.
 */

const DEFAULT_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const HTTP_OK = 200
const HTTP_SERVER_ERROR = 500
const UPSTREAM_DETAIL_LENGTH = 200
const START = 0
const LOCAL_STACK = /kong|localhost|127\.0\.0\.1/
const RESEND_URL = "https://api.resend.com/emails"
const SEND_TIMEOUT_MS = 5000
const BATCH_TIMEOUT_MS = 30000

/**
 * An environment variable that must be set.
 * @param {string} name
 * @returns {string}
 */
export function env(name) {
  const value = globalThis.Deno?.env.get(name)
  if (!value) throw new Error(`${name} is not set`)
  return value
}

/**
 * A JSON response with CORS headers, which a browser calling the function
 * needs on every answer, errors included.
 * @param {unknown} body
 * @param {number} [status]
 * @param {Record<string, string>} [headers]
 * @returns {Response}
 */
export function json(body, status = HTTP_OK, headers = {}) {
  return Response.json(body, {
    status,
    headers: { ...DEFAULT_CORS, ...headers },
  })
}

/**
 * Wraps a handler: it answers the CORS preflight, and turns a thrown error
 * into a JSON `{ error }` with status 500, so the browser reads the message
 * instead of a CORS failure.
 * @param {(req: Request) => Promise<Response>} handler
 * @param {{ fallbackError?: string }} [options]
 * @returns {(req: Request) => Promise<Response>}
 */
export function handle(handler, { fallbackError = "Unexpected error" } = {}) {
  return async (req) => {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: DEFAULT_CORS })
    }
    try {
      return await handler(req)
    } catch (err) {
      const message = err instanceof Error ? err.message : ""
      return json({ error: message || fallbackError }, HTTP_SERVER_ERROR)
    }
  }
}

/**
 * Serves a handler wrapped by `handle`.
 * @param {(req: Request) => Promise<Response>} handler
 * @param {{ fallbackError?: string }} [options]
 */
export function serve(handler, options) {
  globalThis.Deno.serve(handle(handler, options))
}

/**
 * An error for a failed call to another service, with the start of its body.
 * @param {string} service
 * @param {Response} res
 * @returns {Promise<Error>}
 */
export async function upstreamError(service, res) {
  const detail = await res.text()
  return new Error(
    `${service} ${res.status}: ${detail.slice(START, UPSTREAM_DETAIL_LENGTH)}`,
  )
}

/**
 * The bearer token of a request, or `""`.
 * @param {Request} req
 * @returns {string}
 */
export function bearerToken(req) {
  return (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "")
}

/**
 * The signed-in user making the request, from their access token, never from
 * the body. `null` without a valid token.
 * @param {{ auth: { getUser: (jwt: string) => Promise<{ data: { user: unknown } }> } }} client - Usually one with the service role key.
 * @param {Request} req
 */
export async function currentUser(client, req) {
  const token = bearerToken(req)
  if (!token) return null
  const { data } = await client.auth.getUser(token)
  return data.user ?? null
}

/**
 * The `role` claim of the request's JWT, such as `"service_role"`, read
 * without verifying it: the platform verifies the token before the function
 * runs, unless `verify_jwt` is off. Only legacy JWT keys carry a role;
 * `sb_secret_` keys do not.
 * @param {Request} req
 * @returns {string | null}
 */
export function callerRole(req) {
  try {
    const [, payload] = bearerToken(req).split(".")
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const bytes = Uint8Array.from(atob(base64), (char) =>
      char.charCodeAt(START),
    )
    return JSON.parse(new TextDecoder().decode(bytes)).role ?? null
  } catch {
    return null
  }
}

/**
 * Whether a Supabase URL is the local stack's, where functions should not
 * reach paid or outside services.
 * @param {string} url - Usually `SUPABASE_URL`.
 * @returns {boolean}
 */
export function isLocalStack(url) {
  return LOCAL_STACK.test(url)
}

/** An error from Resend, with its HTTP status: 429 is the rate or daily limit. */
export class EmailError extends Error {
  /**
   * @param {number} status
   * @param {string} detail
   */
  constructor(status, detail) {
    super(`Resend ${status}: ${detail}`)
    this.name = "EmailError"
    this.status = status
  }
}

/**
 * Sends one email through Resend.
 * @param {{ to: string | string[], subject: string, text?: string, html?: string, headers?: Record<string, string> }} email
 * @param {{ apiKey: string, from: string }} options
 */
export async function sendEmail(email, { apiKey, from }) {
  await postToResend(RESEND_URL, { from, ...email }, apiKey, SEND_TIMEOUT_MS)
}

/**
 * Sends up to 100 emails through Resend in one request, so a rate limit never
 * splits them: they are sent or refused together.
 * @param {Array<{ to: string | string[], subject: string, text?: string, html?: string, headers?: Record<string, string> }>} emails
 * @param {{ apiKey: string, from: string }} options
 */
export async function sendEmails(emails, { apiKey, from }) {
  if (!emails.length) return
  await postToResend(
    `${RESEND_URL}/batch`,
    emails.map((email) => ({ from, ...email })),
    apiKey,
    BATCH_TIMEOUT_MS,
  )
}

async function postToResend(url, body, apiKey, timeoutMs) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!res.ok) throw new EmailError(res.status, await res.text())
}
