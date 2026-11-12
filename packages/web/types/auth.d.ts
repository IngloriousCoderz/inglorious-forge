import { Api } from "./mount"

/** The signed-in user, as the backend describes them. */
export interface AuthUser {
  id: string
  email?: string
  [key: string]: unknown
}

/** What a code sent by email is for. */
export type AuthCodePurpose = "signIn" | "signUp" | "reset"

/** How people sign in: a password, a code sent by email, or both. */
export type AuthMethod = "password" | "code"

/** What went wrong, as a key the screen turns into words. */
export type AuthError =
  | "invalidEmail"
  | "invalidCode"
  | "weakPassword"
  | "invalidCredentials"
  | "emailNotConfirmed"
  | "accountExists"
  | "rateLimited"
  | "captcha"
  | "network"
  | "unknown"

/** Where accounts live. Each call rejects on failure. */
export interface AuthAdapter {
  /** Calls `listener` with the user on every sign-in and sign-out, and once the saved session is known. */
  onSessionChange(listener: (user: AuthUser | null) => void): () => void
  /** Whether the email has an account: skips straight to the password or the new account. */
  accountExists?(email: string): Promise<boolean>
  signIn(email: string, password: string): Promise<AuthUser>
  /** The user when signed in at once, `null` when the email needs confirming with a code. */
  signUp(
    email: string,
    password: string,
    data?: Record<string, unknown>,
  ): Promise<AuthUser | null>
  /** Sends a sign-in code, creating the account on first use. */
  sendCode(email: string): Promise<void>
  verifyCode(
    email: string,
    code: string,
    purpose: AuthCodePurpose,
  ): Promise<AuthUser>
  resendCode(email: string, purpose: AuthCodePurpose): Promise<void>
  sendResetCode(email: string): Promise<void>
  /** Sets the signed-in user's new password. */
  updatePassword(password: string): Promise<AuthUser>
  signOut(): Promise<void>
  /** Deletes the signed-in user's account and everything that is theirs, then signs out. */
  eraseAccount(): Promise<void>
  /** The key for a failure. */
  errorCode?(error: unknown): AuthError
}

export interface AuthConfig {
  adapter: AuthAdapter
  /** Defaults to `["password"]`. */
  methods?: AuthMethod[]
  /** Defaults to 8. */
  minPasswordLength?: number
}

export interface AuthEntity {
  id?: string
  type: string
  user: AuthUser | null
  /** The saved session has been read: until then, the user is unknown. */
  isReady: boolean
  methods: AuthMethod[]
  step: "email" | "password" | "signUp" | "code" | "reset"
  email: string
  codeFor: AuthCodePurpose | null
  /** `"idle"` until the first request. */
  status: "idle" | "loading" | "success" | "error"
  error: AuthError | null
  isCodeResent: boolean
  /** The user asked to erase their account and hasn't confirmed yet. */
  isEraseAsked: boolean
}

type Handler<TPayload = void> = (
  entity: AuthEntity,
  payload: TPayload,
  api?: Api,
) => void

export type AuthType = {
  create(entity: AuthEntity): void
  sessionChange: Handler<AuthUser | null>
  emailSubmit: Handler<string>
  signInSubmit: Handler<string>
  signUpShow: Handler
  signInShow: Handler
  signUpSubmit: Handler<{
    password: string
    data?: Record<string, unknown>
  }>
  codeRequest: Handler
  codeSubmit: Handler<string>
  codeResend: Handler
  resetRequest: Handler
  resetSubmit: Handler<{ code: string; password: string }>
  back: Handler
  signOut: Handler
  accountEraseAsk: Handler
  accountEraseCancel: Handler
  accountErase: Handler
  [handler: string]: unknown
}

/** The type behind a sign-in screen, holding the signed-in `user`. */
export declare function createAuth(config: AuthConfig): AuthType

/**
 * Keeps the entity's `user` in step with the backend's session.
 * @returns A function that stops watching.
 */
export declare function watchAuth(
  adapter: Pick<AuthAdapter, "onSessionChange">,
  store: { notify(type: string, payload?: unknown): void },
  options?: { id?: string },
): () => void
