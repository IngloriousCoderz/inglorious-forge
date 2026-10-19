/* eslint-disable no-magic-numbers */

/**
 * Appends a point to the entity's data, dropping the oldest beyond
 * `maxHistory`. The point is `payload.point`, or one built from
 * `payload.value` at the next index.
 */
export function streamSlide(entity, payload = {}) {
  if (!Array.isArray(entity.data)) entity.data = []

  const nextIndex = Number.isFinite(entity.streamIndex)
    ? entity.streamIndex + 1
    : entity.data.length
  const xKey = entity.streamXKey || "name"
  const yKey = entity.streamYKey || "value"
  const nextPoint = payload.point || {
    [xKey]: entity.streamIndexAsNumber ? nextIndex : `${nextIndex}`,
    [yKey]: Number.isFinite(payload.value) ? payload.value : 0,
  }
  const maxHistory = Number.isFinite(payload.maxHistory)
    ? payload.maxHistory
    : entity.maxHistory

  entity.streamIndex = nextIndex
  entity.data = [...entity.data, nextPoint]

  if (
    Number.isFinite(maxHistory) &&
    maxHistory > 0 &&
    entity.data.length > maxHistory
  ) {
    entity.data = entity.data.slice(-maxHistory)
  }
}
