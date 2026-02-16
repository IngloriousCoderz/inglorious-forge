/**
 * Convenience helper to run exit animation before removing an entity.
 *
 * @param {object} api
 * @param {string} entityId
 * @param {{ exitVariant?: string }} [payload]
 */
export function removeWithMotion(api, entityId, payload = {}) {
  api.notify(`#${entityId}:requestRemove`, payload)
}
