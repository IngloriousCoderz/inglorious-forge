/** What `watchBackButton` needs of `App` from `@capacitor/app`. */
export interface BackButtonApp {
  exitApp(): Promise<void>
  addListener(
    event: "backButton",
    listener: (event: { canGoBack: boolean }) => void,
  ): Promise<{ remove(): Promise<void> }>
}

export interface WatchBackButtonOptions {
  /** The top-level paths, where back closes the app. Defaults to `["/"]`. */
  rootPaths?: string[]
}

/**
 * Android's back button and back gesture: back in history, or closes the app
 * on a root path or when there is no history left. Does nothing outside a
 * native app.
 * @returns A function that stops listening.
 */
export declare function watchBackButton(
  app: BackButtonApp,
  options?: WatchBackButtonOptions,
): () => Promise<void>
