import { Api } from "../mount"

export interface PageVisibilityEntity {
  id: string | number
  type?: "PageVisibility"
  isSupported: boolean
  isVisible: boolean
  isWatching: boolean
}

export interface PageVisibilityType {
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
