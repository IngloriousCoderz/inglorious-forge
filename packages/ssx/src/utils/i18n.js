export function getLocaleFromPath(
  pathname,
  { defaultLocale = "en", locales = [] } = {},
) {
  const [pathOnly] = pathname.split("?")
  const [cleanPath] = pathOnly.split("#")
  const first = cleanPath.split("/").filter(Boolean)[0]

  if (first && locales.includes(first)) return first
  return defaultLocale
}
