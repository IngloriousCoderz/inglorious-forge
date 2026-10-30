/**
 * @typedef {import('../types').IconSource} IconSource
 * @typedef {{ body: string, width?: number, height?: number }} IconData
 */

const DEFAULT_SIZE = 24

/**
 * Finds icons by the names a model writes, such as `"circle-check"`, in what
 * the app gives: a map of names to Iconify icons, or a whole Iconify
 * collection, as `@iconify-json/lucide` has it. A name it does not have finds
 * nothing, so the icon is left out rather than drawn wrong.
 * @param {IconSource | undefined} icons
 * @returns {(name: string) => IconData | null}
 */
export function createIconResolver(icons) {
  if (!icons) return () => null

  if (icons.icons && typeof icons.icons === "object") {
    const width = icons.width ?? DEFAULT_SIZE
    const height = icons.height ?? DEFAULT_SIZE
    return (name) => {
      const icon =
        icons.icons[name] ?? icons.icons[icons.aliases?.[name]?.parent]
      return icon?.body
        ? {
            body: icon.body,
            width: icon.width ?? width,
            height: icon.height ?? height,
          }
        : null
    }
  }

  return (name) => (icons[name]?.body ? icons[name] : null)
}
