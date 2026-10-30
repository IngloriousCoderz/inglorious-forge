import { createApi } from "@inglorious/store/api.js"
import { EventMap } from "@inglorious/store/event-map.js"

import { findCollision } from "../../../collision/detection.js"
import { EntityPools } from "./entity-pools.js"

export function entityPoolMiddleware() {
  return (store) => {
    const pools = new EntityPools()
    const eventMap = new EventMap()

    store.extras ??= {}
    store.extras.getAllActivePoolEntities = () => pools.getAllActiveEntities()

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

    const next = store.dispatch
    store.dispatch = (event) => {
      switch (event.type) {
        case "spawn": {
          const entity = pools.acquire(event.payload)
          const type = store.getType(entity.type)
          eventMap.addEntity(entity.id, type, entity.type)
          break
        }

        case "despawn": {
          const entity = pools.recycle(event.payload)
          const type = store.getType(entity.type)
          eventMap.removeEntity(entity.id, type, entity.type)
          break
        }

        default: {
          const entityIds = eventMap.getEntitiesForEvent(event.type)
          for (const id of entityIds) {
            const entity = pools.activeEntitiesById.get(id)
            if (!entity) continue

            const type = store.getType(entity.type)
            const handle = type[event.type]
            handle?.(entity, event.payload, api)
          }
        }
      }

      return next(event)
    }

    return store
  }
}
