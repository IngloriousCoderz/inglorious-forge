import { Api } from "./mount"

export interface PwaUpdateEntity {
  id?: string
  type: string
  /** A new version landed mid-session and waits for the next reload. */
  isUpdateReady: boolean
}

export type PwaUpdateType = {
  create(entity: PwaUpdateEntity): void
  /** Moves over to the waiting version now, reloading the page. */
  pwaUpdateApply(): void
  pwaUpdateReady(entity: PwaUpdateEntity): void
}

export declare const PwaUpdate: PwaUpdateType

export interface WatchPwaUpdateOptions {
  /** The PwaUpdate entity to announce to. Defaults to `pwaUpdate`. */
  id?: string
  /** How often to check for a new version. Defaults to one hour. */
  checkEveryMs?: number
}

/**
 * Keeps an installed PWA on its latest version, applying a downloaded one at
 * boot and on each trip to or from the background. A version that lands
 * mid-session is announced to `store` as `#${id}:pwaUpdateReady`.
 * @returns A function that stops watching.
 */
export declare function watchPwaUpdate(
  registration: ServiceWorkerRegistration,
  store?: Pick<Api, "notify">,
  options?: WatchPwaUpdateOptions,
): () => void

/** Moves the page over to the waiting version and reloads. */
export declare function applyPwaUpdate(
  registration?: ServiceWorkerRegistration,
): Promise<void>
