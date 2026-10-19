import { Api } from "../mount"

export interface PageVisibilityEntity {
  id?: string
  type: string
  isSupported: boolean
  isVisible: boolean
  isWatching: boolean
}

export type PageVisibilityType = {
  create(entity: PageVisibilityEntity, payload: unknown, api: Api): void
  destroy(entity: PageVisibilityEntity, payload: unknown, api: Api): void
  pageVisibilityChange(entity: PageVisibilityEntity, value: boolean): void
  pageVisibilityWatch(
    entity: PageVisibilityEntity,
    payload: unknown,
    api: Api,
  ): void
  pageVisibilityUnwatch(entity: PageVisibilityEntity): void
}

export declare const PageVisibility: PageVisibilityType
