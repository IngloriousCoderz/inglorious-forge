import { mod, scale, sum } from "@inglorious/utils/vectors"

export function infiniteScroll() {
  return {
    update(entity, dt, api) {
      // A paused game freezes the world, scrolling included.
      if (api.getEntity("game")?.paused) return

      entity.position = mod(
        sum(entity.position, scale(entity.velocity, dt)),
        entity.image.loop,
      )
    },
  }
}
