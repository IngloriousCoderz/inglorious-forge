import { findCollision } from "@inglorious/engine/collision/detection.js"
import { createApi } from "@inglorious/store/api.js"
import { EventMap } from "@inglorious/store/event-map.js"

import { EntityPools } from "./entity-pools"

export function entityPoolMiddleware() {
  return (store) => {
    const pools = new EntityPools()
    const eventMap = new EventMap()

    store.extras ??= {}
    store.extras.getAllActivePoolEntities = () => pools.getAllActiveEntities()

    // Pooled entities live outside of the store, so they are merged into the
    // given entities to take part in collision detection just like the others.
    store.extras.findCollision = (
      entity,
      entities = store.getState(),
      collisionGroup,
    ) =>
      findCollision(
        entity,
        { ...entities, ...pools.getAllActiveEntitiesById() },
        collisionGroup,
      )

    const game = store.getState().game
    if (game.devMode) {
      store.extras.getEntityPoolsStats = () => pools.getStats()
    }

    const api = createApi(store)

    return (next) => (event) => {
      switch (event.type) {
        case "spawn": {
          const entity = pools.acquire(event.payload)
          const type = store.getType(entity.type)
          eventMap.addEntity(entity.id, type)
          break
        }

        case "despawn": {
          const entity = pools.recycle(event.payload)
          const type = store.getType(entity.type)
          eventMap.removeEntity(entity.id, type)
          break
        }

        default: {
          const entityIds = eventMap.getEntitiesForEvent(event.type)
          for (const id of entityIds) {
            const entity = pools.activeEntitiesById.get(id)
            const type = store.getType(entity.type)
            const handle = type[event.type]
            handle?.(entity, event.payload, api)
          }
        }
      }

      return next(event)
    }
  }
}
