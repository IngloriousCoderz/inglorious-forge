/** An email for Resend. */
export interface Email {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  headers?: Record<string, string>
}

export interface ResendOptions {
  apiKey: string
  /** Such as `"Vaitu <hello@vaitu.net>"`. */
  from: string
}

/** An environment variable that must be set; throws when it is not. */
export function env(name: string): string

/** A JSON response with CORS headers. */
export function json(
  body: unknown,
  status?: number,
  headers?: Record<string, string>,
): Response

export interface HandleOptions {
  /** The error message when a thrown value has none. Defaults to `"Unexpected error"`. */
  fallbackError?: string
}

/**
 * Wraps a handler: answers the CORS preflight, and turns a thrown error into
 * a JSON `{ error }` with status 500.
 */
export function handle(
  handler: (req: Request) => Promise<Response>,
  options?: HandleOptions,
): (req: Request) => Promise<Response>

/** `Deno.serve` with a handler wrapped by `handle`. */
export function serve(
  handler: (req: Request) => Promise<Response>,
  options?: HandleOptions,
): void

/** An error for a failed call to another service, with the start of its body. */
export function upstreamError(service: string, res: Response): Promise<Error>

/** The bearer token of a request, or `""`. */
export function bearerToken(req: Request): string

/** The signed-in user making the request, from their access token. `null` without a valid one. */
export function currentUser<User>(
  client: {
    auth: {
      getUser(jwt: string): Promise<{ data: { user: User | null } }>
    }
  },
  req: Request,
): Promise<User | null>

/**
 * The caller's IP address, or `null`: Cloudflare's `cf-connecting-ip`, which
 * the caller cannot set, else the first `x-forwarded-for` entry, which it can.
 */
export function clientIp(req: Request): string | null

/** The `role` claim of the request's JWT, unverified. `null` when there is none. */
export function callerRole(req: Request): string | null

/** Whether a Supabase URL is the local stack's. */
export function isLocalStack(url: string): boolean

/** An error from Resend, with its HTTP status: 429 is the rate or daily limit. */
export class EmailError extends Error {
  status: number
  constructor(status: number, detail: string)
}

/** Sends one email through Resend. */
export function sendEmail(email: Email, options: ResendOptions): Promise<void>

/** Sends up to 100 emails through Resend in one request, sent or refused together. */
export function sendEmails(
  emails: Email[],
  options: ResendOptions,
): Promise<void>
