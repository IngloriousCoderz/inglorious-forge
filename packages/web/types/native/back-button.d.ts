/** What `createBackButton` needs of `App` from `@capacitor/app`. */
export interface BackButtonPlugin {
  exitApp(): Promise<void>
  addListener(
    event: "backButton",
    listener: (event: { canGoBack: boolean }) => void,
  ): Promise<{ remove(): Promise<void> }>
}

export interface BackButtonConfig {
  plugin: BackButtonPlugin
}

export interface BackButtonEntity {
  id?: string
  type: string
  /** The top-level paths, where back closes the app. Defaults to `["/"]`. */
  rootPaths: string[]
}

export type BackButtonType = {
  create(entity: BackButtonEntity): void
  destroy(entity: BackButtonEntity): void
  /** Back in history, or closes the app on a root path or with no history left. */
  backButtonPress(entity: BackButtonEntity, event: { canGoBack: boolean }): void
}

/**
 * The type behind Android's back button and back gesture. Does nothing outside
 * a native app.
 */
export declare function createBackButton(
  config: BackButtonConfig,
): BackButtonType
