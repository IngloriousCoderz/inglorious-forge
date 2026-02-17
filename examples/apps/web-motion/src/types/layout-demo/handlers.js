const SWAPS = 4
const STEP = 1

export function shuffle(entity) {
  for (let i = 0; i < SWAPS; i += STEP) {
    const a = Math.floor(Math.random() * entity.order.length)
    const b = Math.floor(Math.random() * entity.order.length)
    const tmp = entity.order[a]
    entity.order[a] = entity.order[b]
    entity.order[b] = tmp
  }
}
