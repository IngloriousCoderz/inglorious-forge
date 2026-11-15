export interface PwaUpdateConfig {
  /** How often to check for a new version. Defaults to one hour. */
  checkEveryMs?: number
}

export interface PwaUpdateEntity {
  id?: string
  type: string
  /** A new version landed mid-session and waits for the next reload. */
  isUpdateReady: boolean
}

export type PwaUpdateType = {
  create(entity: PwaUpdateEntity): void
  destroy(entity: PwaUpdateEntity): void
  pwaUpdateReady(entity: PwaUpdateEntity): void
  /** Moves over to the waiting version now, reloading the page. */
  pwaUpdateApply(): void
}

/**
 * The type that keeps an installed PWA on its latest version, applying a
 * downloaded one at boot and on each trip to or from the background, and
 * setting `isUpdateReady` when a version lands mid-session. Does nothing in a
 * native app or without a service worker.
 */
export declare function createPwaUpdate(config?: PwaUpdateConfig): PwaUpdateType

/** Moves the page over to the waiting version and reloads. */
export declare function applyPwaUpdate(
  registration?: ServiceWorkerRegistration,
): Promise<void>
