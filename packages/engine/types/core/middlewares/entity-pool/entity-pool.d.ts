import type { BaseEntity } from "@inglorious/store"

/** Recycles entities of one type rather than making new ones. */
export class EntityPool<TEntity extends BaseEntity = BaseEntity> {
  populate(factory: () => TEntity, count: number): void
  acquire(props: TEntity): TEntity & { id: string }
  recycle(entity: TEntity): TEntity
  getStats(): { active: number; inactive: number }
}
