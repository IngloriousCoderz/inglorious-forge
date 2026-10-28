import type { Store } from "@inglorious/store"

export interface I18nConfig {
  defaultLocale: string
  locales: string[]
}

export interface SiteHead {
  title?: string
  lang?: string
  meta?: Record<string, string>
}

export function getLocaleFromPath(pathname: string, config: I18nConfig): string

export function waitForLocale(store: Store, locale?: string): Promise<void>

export function syncPageHead(
  store: Store,
  modules: Record<string, Record<string, unknown>>,
  site?: SiteHead,
): () => string | null
