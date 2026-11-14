/** What `createNativeStorage` needs of `Preferences` from `@capacitor/preferences`. */
export interface PreferencesPlugin {
  get(options: { key: string }): Promise<{ value: string | null }>
  set(options: { key: string; value: string }): Promise<void>
  remove(options: { key: string }): Promise<void>
}

/** A storage for `withStorage`: answering with promises in a native app. */
export interface NativeStorage {
  getItem(key: string): string | null | Promise<string | null>
  setItem(key: string, value: string): void | Promise<void>
  removeItem(key: string): void | Promise<void>
}

/** Capacitor Preferences in a native app, `localStorage` in a browser. */
export declare function createNativeStorage(config?: {
  plugin?: PreferencesPlugin
}): NativeStorage

/** What `createSecureStorage` needs of `NativeBiometric` from `@capgo/capacitor-native-biometric`. */
export interface SecureStoragePlugin {
  getData(options: { key: string }): Promise<{ value: string }>
  setData(options: { key: string; value: string }): Promise<void>
  deleteData(options: { key: string }): Promise<void>
}

/** The Keychain or Keystore in a native app, `localStorage` in a browser. */
export declare function createSecureStorage(config?: {
  plugin?: SecureStoragePlugin
}): NativeStorage
