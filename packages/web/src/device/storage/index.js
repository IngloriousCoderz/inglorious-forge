import { isNative } from "../../native/index.js"

/**
 * A storage for `withStorage` that survives the operating system clearing the
 * WebView's data: in a native app, Capacitor Preferences (`Preferences` from
 * `@capacitor/preferences`, given as `plugin`), answering with promises; in a
 * browser, `localStorage`, looked up at each call. It also serves as Supabase's `auth.storage`,
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
  if (!plugin || !isNative()) {
    return {
      getItem: (key) => browserStorage()?.getItem(key) ?? null,
      setItem: (key, value) => browserStorage()?.setItem(key, value),
      removeItem: (key) => browserStorage()?.removeItem(key),
    }
  }

  return {
    getItem: async (key) => (await plugin.get({ key })).value,
    setItem: (key, value) => plugin.set({ key, value }),
    removeItem: (key) => plugin.remove({ key }),
  }
}

/**
 * A storage for secrets, such as a session's tokens: in a native app the
 * Keychain (iOS) or Keystore (Android), through `NativeBiometric` from
 * `@capgo/capacitor-native-biometric`, given as `plugin`; in a browser, which
 * has nothing safer, `localStorage`. Use it as `withStorage`'s storage or
 * Supabase's `auth.storage`.
 *
 * Only a key that isn't there reads as `null`. The plugin rejects for a
 * missing key and for a failed read alike, so a rejection is checked with
 * `isDataSaved`: a secret that is saved but couldn't be read rejects instead.
 * To Supabase, `null` means signed out, and a failed read must not sign
 * anyone out.
 *
 * @param {{ plugin?: { getData(options: { key: string }): Promise<{ value: string }>, setData(options: { key: string, value: string }): Promise<void>, deleteData(options: { key: string }): Promise<void>, isDataSaved(options: { key: string }): Promise<{ isSaved: boolean }> } }} [config]
 *
 * @example
 * import { NativeBiometric } from "@capgo/capacitor-native-biometric"
 * const secrets = createSecureStorage({ plugin: NativeBiometric })
 * createClient(url, key, { auth: { storage: secrets } })
 */
export function createSecureStorage({ plugin } = {}) {
  if (!plugin || !isNative()) return createNativeStorage()

  return {
    async getItem(key) {
      try {
        return (await plugin.getData({ key })).value
      } catch (error) {
        // Unsure whether it's saved: a failure, not an absence.
        const { isSaved } = await plugin
          .isDataSaved({ key })
          .catch(() => ({ isSaved: true }))
        if (isSaved) throw error
        return null
      }
    },
    setItem: (key, value) => plugin.setData({ key, value }),
    removeItem: (key) => plugin.deleteData({ key }),
  }
}

// Never Node's own localStorage: on a server it would be shared by every request.
function browserStorage() {
  return globalThis.window?.localStorage
}
