import { Api } from "../mount"

export interface MediaQueryEntity {
  id?: string
  type: string
  media: string
  matches: boolean
  isSupported: boolean
  isWatching: boolean
}

export interface MediaQueryMatchEvent {
  matches: boolean
}

export type MediaQueryType = {
  create(entity: MediaQueryEntity, payload: unknown, api: Api): void
  destroy(entity: MediaQueryEntity): void
  mediaQueryChange(entity: MediaQueryEntity, event: MediaQueryMatchEvent): void
  mediaQueryWatch(entity: MediaQueryEntity, payload: unknown, api: Api): void
  mediaQueryUnwatch(entity: MediaQueryEntity): void
}

export declare const MediaQuery: MediaQueryType
