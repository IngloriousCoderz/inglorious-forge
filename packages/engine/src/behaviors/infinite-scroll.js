import { mod, scale, sum } from "@inglorious/utils/vectors"

export function infiniteScroll() {
  return {
    update(entity, dt) {
      entity.position = mod(
        sum(entity.position, scale(entity.velocity, dt)),
        entity.image.loop,
      )
    },
  }
}
