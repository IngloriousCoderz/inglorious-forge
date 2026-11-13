export declare function isNative(): boolean

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
