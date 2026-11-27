import type { BaseEntity } from "@inglorious/store"

/** An entity pool per type. */
export class EntityPools<TEntity extends BaseEntity = BaseEntity> {
  readonly activeEntitiesById: Map<string, TEntity & { id: string }>
  getAllActiveEntitiesById(): Record<string, TEntity & { id: string }>
  acquire(props: TEntity): TEntity & { id: string }
  recycle(props: TEntity): TEntity
  getStats(): Record<string, { active: number; inactive: number }>
  lazyInit(entity: TEntity): void
  getAllActiveEntities(): (TEntity & { id: string })[]
}
