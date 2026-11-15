/** What `createAppLinks` needs of `App` from `@capacitor/app`. */
export interface AppLinksPlugin {
  getLaunchUrl(): Promise<{ url: string } | undefined>
  addListener(
    event: "appUrlOpen",
    listener: (event: { url: string }) => void,
  ): Promise<{ remove(): Promise<void> }>
}

export interface AppLinksConfig {
  plugin: AppLinksPlugin
  /** The router entity to notify. Defaults to `router`. */
  router?: string
}

export interface AppLinksEntity {
  id?: string
  type: string
  /** The last link opened, or `null`. */
  url: string | null
}

export type AppLinksType = {
  create(entity: AppLinksEntity): void
  destroy(entity: AppLinksEntity): void
  /** Sends the router to the link's path. */
  appLinkOpen(entity: AppLinksEntity, url: string): void
}

/**
 * The type that opens Universal Links and App Links in the router, both the
 * link that started the app and those that arrive while it runs. Does nothing
 * outside a native app.
 */
export declare function createAppLinks(config: AppLinksConfig): AppLinksType
