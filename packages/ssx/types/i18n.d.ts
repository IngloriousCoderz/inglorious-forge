export interface I18nConfig {
  defaultLocale: string
  locales: string[]
}

export function getLocaleFromPath(pathname: string, config: I18nConfig): string
