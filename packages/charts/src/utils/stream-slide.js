/* eslint-disable no-magic-numbers */
import { ensureFiniteNumber } from "./data-utils.js"

function buildPoint(entity, nextIndex, nextValue) {
  const xKey = entity.streamXKey ?? "name"
  const yKey = entity.streamYKey ?? "value"
  const indexValue = entity.streamIndexAsNumber ? nextIndex : `${nextIndex}`

  return {
    [xKey]: indexValue,
    [yKey]: nextValue,
  }
}

export function streamSlide(entity, payload) {
  if (!Array.isArray(entity.data) || !entity.data.length) return

  const nextIndex =
    ensureFiniteNumber(entity.streamIndex, entity.data.length - 1) + 1
  const nextValue = ensureFiniteNumber(payload?.value, 0)
  const nextPoint = payload?.point || buildPoint(entity, nextIndex, nextValue)
  const configuredWindowSize = payload?.windowSize ?? entity.streamWindow
  const configuredMaxHistory = payload?.maxHistory ?? entity.maxHistory
  const hasWindowSize =
    Number.isFinite(configuredWindowSize) && configuredWindowSize > 0
  const hasMaxHistory =
    Number.isFinite(configuredMaxHistory) && configuredMaxHistory > 0

  entity.streamIndex = nextIndex

  let nextData
  if (!hasWindowSize) {
    nextData = [...entity.data, nextPoint]
  } else {
    const windowSize = Math.max(1, configuredWindowSize)
    nextData = [...entity.data.slice(-(windowSize - 1)), nextPoint]
  }

  if (hasMaxHistory && nextData.length > configuredMaxHistory) {
    nextData = nextData.slice(-configuredMaxHistory)
  }

  entity.data = nextData
}
