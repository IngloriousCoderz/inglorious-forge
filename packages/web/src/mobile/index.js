export function isNative() {
  const capacitor = globalThis.Capacitor ?? globalThis.window?.Capacitor ?? null

  if (!capacitor) {
    return false
  }

  if (typeof capacitor.isNativePlatform === "function") {
    return capacitor.isNativePlatform()
  }

  if (typeof capacitor.getPlatform === "function") {
    return ["android", "ios"].includes(capacitor.getPlatform())
  }

  return capacitor.isNative === true
}

/**
 * A storage for `withStorage` that survives the operating system clearing the
 * WebView's data: in a native app, Capacitor Preferences (`Preferences` from
 * `@capacitor/preferences`, given as `plugin`), answering with promises; in a
 * browser, `localStorage` itself. It also serves as Supabase's `auth.storage`,
 * keeping the session there too.
 *
 * @param {{ plugin?: { get(options: { key: string }): Promise<{ value: string | null }>, set(options: { key: string, value: string }): Promise<void>, remove(options: { key: string }): Promise<void> } }} [config]
 *
 * @example
 * import { Preferences } from "@capacitor/preferences"
 * const preferences = createNativeStorage({ plugin: Preferences })
 * const types = {
 *   Settings: [Settings, withStorage(["theme"], { storage: () => preferences })],
 * }
 */
export function createNativeStorage({ plugin } = {}) {
  if (!plugin || !isNative()) return globalThis.localStorage

  return {
    getItem: async (key) => (await plugin.get({ key })).value,
    setItem: (key, value) => plugin.set({ key, value }),
    removeItem: (key) => plugin.remove({ key }),
  }
}
