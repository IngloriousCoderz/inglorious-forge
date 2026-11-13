import type { SupabaseClient } from "@supabase/supabase-js"

/** Delivers a backend's changes, one table at a time, as `withLiveReload` expects. */
export interface LiveSource {
  /** Calls `onChange` on every change to `table`; returns the unsubscribe. */
  subscribe(table: string, onChange: () => void): () => void
}

export interface RealtimeSourceOptions {
  /** Defaults to `"public"`. */
  schema?: string
}

/**
 * A live source over Supabase Realtime: one channel per table, joined once
 * the saved session is restored, which tells its subscribers when it joins
 * again after a dropped connection.
 */
export declare function realtimeSource(
  client: SupabaseClient,
  options?: RealtimeSourceOptions,
): LiveSource

/**
 * Whether a Supabase call failed because the server couldn't be reached, as
 * opposed to the server refusing it, for every client: PostgREST, Functions,
 * Auth and Storage.
 */
export declare function isNetworkError(error: unknown): boolean

/** The Turnstile widget failed, or its script could not load. */
export declare class CaptchaError extends Error {
  /** Turnstile's error code, or what went wrong, such as `"timeout"`. */
  code: string
  constructor(code: string)
}

/**
 * Whether a call failed on the CAPTCHA: the widget's own `CaptchaError`, or
 * Supabase Auth refusing the token with `captcha_failed`.
 */
export declare function isCaptchaError(error: unknown): boolean

export interface CaptchaOptions {
  /** The Turnstile site key. Without one, every token is `undefined`. */
  siteKey?: string
  /** Where the widget goes, or its id. It only shows when the person must act. */
  element: string | (() => Element | null)
  /** The widget's language, such as the app's locale. Defaults to `"auto"`. */
  language?: string | (() => string)
}

export interface Captcha {
  /** Starts solving the challenge, so that `token(action)` needn't wait. */
  prepare(action: string): void
  /** A single-use token for one Supabase Auth call, as `options.captchaToken`. */
  token(action: string): Promise<string | undefined>
}

/** Turnstile tokens for Supabase Auth's CAPTCHA protection. */
export declare function createCaptcha(options: CaptchaOptions): Captcha

export interface SupabaseNativeUpdateOptions {
  /** Defaults to `"app_versions"`. */
  table?: string
  /** Defaults to 10 seconds. */
  timeoutMs?: number
}

/**
 * The adapter of `createNativeUpdate` from `@inglorious/web/native/update`:
 * each platform's minimum build from a table with `platform`, `min_build` and
 * `store_url`, readable before sign-in.
 */
export declare function supabaseNativeUpdate(
  client: SupabaseClient,
  options?: SupabaseNativeUpdateOptions,
): {
  requirement(
    platform: "android" | "ios",
  ): Promise<{ minBuild: number; storeUrl: string | null } | null>
}

/** Where `publishLiveUpdate` puts the manifest. Defaults to the `live-updates` bucket. */
export declare function liveUpdateManifestUrl(
  projectUrl: string,
  options?: { bucket?: string },
): string

export interface SupabaseAuthOptions {
  /** For Supabase Auth's CAPTCHA protection, from `createCaptcha`. */
  captcha?: Captcha
  /**
   * An Edge Function answering `{ exists }` for `{ email }`, to skip straight
   * to the password or the new account.
   */
  accountExistsFunction?: string
  /** The Edge Function that erases the caller's account. Defaults to `"erase-account"`. */
  eraseFunction?: string
}

type AuthUser = { id: string; email?: string; [key: string]: unknown }
type AuthCodePurpose = "signIn" | "signUp" | "reset"
type AuthError =
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

/**
 * The adapter of `createAuth` from `@inglorious/web/auth`, over Supabase
 * Auth: passwords, codes sent by email (the templates' `{{ .Token }}`),
 * password resets and account erasure through an Edge Function.
 */
export declare function supabaseAuth(
  client: SupabaseClient,
  options?: SupabaseAuthOptions,
): {
  onSessionChange(listener: (user: AuthUser | null) => void): () => void
  accountExists?(email: string): Promise<boolean>
  signIn(email: string, password: string): Promise<AuthUser>
  signUp(
    email: string,
    password: string,
    data?: Record<string, unknown>,
  ): Promise<AuthUser | null>
  sendCode(email: string): Promise<void>
  verifyCode(
    email: string,
    code: string,
    purpose: AuthCodePurpose,
  ): Promise<AuthUser>
  verifyLink(tokenHash: string, purpose: AuthCodePurpose): Promise<AuthUser>
  resendCode(email: string, purpose: AuthCodePurpose): Promise<void>
  sendResetCode(email: string): Promise<void>
  updatePassword(password: string): Promise<AuthUser>
  signOut(): Promise<void>
  eraseAccount(): Promise<void>
  errorCode(error: unknown): AuthError
  /** Starts the CAPTCHA of the next step, so its token is ready on submit. */
  prepare(action: "signIn" | "signUp"): void
}
