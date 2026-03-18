/* eslint-disable no-magic-numbers */

export function streamSlide(entity, payload = {}) {
  if (!Array.isArray(entity.data) || entity.data.length === 0) return

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
