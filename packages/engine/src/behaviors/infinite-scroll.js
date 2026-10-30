import { mod, scale, sum } from "@inglorious/utils/vector.js"

export function infiniteScroll() {
  return {
    update(entity, dt, api) {
      if (api.getEntity("game")?.paused) return

      entity.position = mod(
        sum(entity.position, scale(entity.velocity, dt)),
        entity.image.loop,
      )
    },
  }
}
