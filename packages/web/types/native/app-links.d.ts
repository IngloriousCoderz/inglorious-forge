import { Api } from "../mount"

/** What `watchAppLinks` needs of `App` from `@capacitor/app`. */
export interface AppLinksApp {
  getLaunchUrl(): Promise<{ url: string } | undefined>
  addListener(
    event: "appUrlOpen",
    listener: (event: { url: string }) => void,
  ): Promise<{ remove(): Promise<void> }>
}

export interface WatchAppLinksOptions {
  /** The router entity to notify. Defaults to `router`. */
  id?: string
}

/**
 * Opens Universal Links and App Links in the router, both the link that
 * started the app and those that arrive while it runs, notifying
 * `#${id}:navigate`. Does nothing outside a native app.
 * @returns A function that stops listening.
 */
export declare function watchAppLinks(
  app: AppLinksApp,
  store: Pick<Api, "notify">,
  options?: WatchAppLinksOptions,
): () => Promise<void>
