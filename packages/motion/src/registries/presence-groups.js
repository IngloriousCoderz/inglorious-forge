/**
 * Creates an in-memory presence registry used for wait-mode orchestration.
 *
 * @returns {{ acquire(groupId: string): Promise<void>, release(groupId: string): void }}
 */
export function createPresenceGroupRegistry() {
  const groups = new Map()

  return {
    acquire,
    release,
  }

  /**
   * Acquires the removal slot for a presence group.
   * If a slot is already active, queues until release.
   *
   * @param {string} groupId
   * @returns {Promise<void>}
   */
  function acquire(groupId) {
    const state = ensureGroup(groupId)

    if (!state.active) {
      state.active = true
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      state.queue.push(resolve)
    })
  }

  /**
   * Releases the active slot and wakes the next queued entry if present.
   *
   * @param {string} groupId
   */
  function release(groupId) {
    const state = groups.get(groupId)
    if (!state) {
      return
    }

    const next = state.queue.shift()
    if (next) {
      next()
      return
    }

    state.active = false
  }

  /**
   * @param {string} groupId
   * @returns {{ active: boolean, queue: Array<() => void> }}
   */
  function ensureGroup(groupId) {
    if (!groups.has(groupId)) {
      groups.set(groupId, {
        active: false,
        queue: [],
      })
    }

    return groups.get(groupId)
  }
}
