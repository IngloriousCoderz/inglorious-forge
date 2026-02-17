const DEFAULT_SNAPSHOT_TTL_MS = 1200

/**
 * Creates shared-layout snapshot storage used by layoutId transitions.
 *
 * @param {{ ttlMs?: number, now?: () => number }} [config]
 * @returns {{ getSnapshotRect(controller: any): any, storeSnapshot(controller: any): void }}
 */
export function createSharedLayoutRegistry(config = {}) {
  const ttlMs = config.ttlMs ?? DEFAULT_SNAPSHOT_TTL_MS
  const now = config.now ?? (() => Date.now())
  const snapshots = new Map()

  return {
    getSnapshotRect,
    storeSnapshot,
  }

  /**
   * Fetches and consumes a valid shared snapshot for the controller layoutId.
   *
   * @param {{ layoutId?: string | null, id?: string | null }} controller
   * @returns {DOMRect | null}
   */
  function getSnapshotRect(controller) {
    if (!controller.layoutId) {
      return null
    }

    const snapshot = snapshots.get(controller.layoutId)
    if (!snapshot) {
      return null
    }

    if (now() - snapshot.at > ttlMs) {
      snapshots.delete(controller.layoutId)
      return null
    }

    if (snapshot.entityId === controller.id) {
      return null
    }

    snapshots.delete(controller.layoutId)
    return snapshot.rect
  }

  /**
   * Stores the controller rect as the latest shared-layout source.
   *
   * @param {{ layoutId?: string | null, id?: string | null, element?: HTMLElement | null, layoutRect?: DOMRect | null }} controller
   */
  function storeSnapshot(controller) {
    if (!controller.layoutId) {
      return
    }

    const snapshotRect =
      controller.element?.getBoundingClientRect?.() || controller.layoutRect
    if (!snapshotRect) {
      return
    }

    snapshots.set(controller.layoutId, {
      at: now(),
      entityId: controller.id,
      rect: snapshotRect,
    })
  }
}
