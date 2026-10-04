import { EntityPool } from "./entity-pool"

export class EntityPools {
  _pools = new Map()
  _activeEntitiesById = new Map()

  get activeEntitiesById() {
    return this._activeEntitiesById
  }

  getAllActiveEntitiesById() {
    return Object.fromEntries(this._activeEntitiesById)
  }

  acquire(props) {
    this.lazyInit(props)
    const entity = this._pools.get(props.type).acquire(props)
    this._activeEntitiesById.set(entity.id, entity)
    return entity
  }

  recycle(props) {
    this.lazyInit(props)
    const entity = this._pools.get(props.type).recycle(props)
    this._activeEntitiesById.delete(entity.id)
    return entity
  }

  getStats() {
    const stats = {}
    for (const [type, pool] of this._pools.entries()) {
      stats[type] = pool.getStats()
    }
    return stats
  }

  lazyInit(entity) {
    if (!this._pools.get(entity.type)) {
      this._pools.set(entity.type, new EntityPool())
    }
  }

  getAllActiveEntities() {
    return Array.from(this._activeEntitiesById.values())
  }
}
