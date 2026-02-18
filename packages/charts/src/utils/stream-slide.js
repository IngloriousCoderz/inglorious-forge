import { ensureFiniteNumber } from "./data-utils.js"

const ZERO = 0
const ONE = 1

function buildPoint(entity, nextIndex, nextValue) {
  const xKey = entity.streamXKey
  const yKey = entity.streamYKey
  const indexValue = entity.streamIndexAsNumber ? nextIndex : `${nextIndex}`

  return {
    [xKey]: indexValue,
    [yKey]: nextValue,
  }
}

export function streamSlide(entity, payload) {
  if (!Array.isArray(entity.data) || !entity.data.length) return
  if (!entity.streamXKey || !entity.streamYKey) return

  const nextIndex =
    ensureFiniteNumber(entity.streamIndex, entity.data.length - ONE) + ONE
  const nextValue = ensureFiniteNumber(payload?.value, ZERO)
  const nextPoint = payload?.point || buildPoint(entity, nextIndex, nextValue)
  const windowSize = Math.max(
    ONE,
    payload?.windowSize ?? entity.streamWindow ?? entity.data.length,
  )

  entity.streamIndex = nextIndex
  entity.data = [...entity.data.slice(-(windowSize - ONE)), nextPoint]
}
