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
      getItem: (key) => globalThis.localStorage?.getItem(key) ?? null,
      setItem: (key, value) => globalThis.localStorage?.setItem(key, value),
      removeItem: (key) => globalThis.localStorage?.removeItem(key),
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
 * @param {{ plugin?: { getData(options: { key: string }): Promise<{ value: string }>, setData(options: { key: string, value: string }): Promise<void>, deleteData(options: { key: string }): Promise<void> } }} [config]
 *
 * @example
 * import { NativeBiometric } from "@capgo/capacitor-native-biometric"
 * const secrets = createSecureStorage({ plugin: NativeBiometric })
 * createClient(url, key, { auth: { storage: secrets } })
 */
export function createSecureStorage({ plugin } = {}) {
  if (!plugin || !isNative()) return createNativeStorage()

  return {
    getItem: (key) =>
      plugin.getData({ key }).then(
        ({ value }) => value,
        () => null,
      ),
    setItem: (key, value) => plugin.setData({ key, value }),
    removeItem: (key) => plugin.deleteData({ key }),
  }
}
