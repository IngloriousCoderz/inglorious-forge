import { Api } from "../mount"

export interface ElementSizeEntity {
  height: number | null
  id?: string
  isSupported: boolean
  isWatching: boolean
  selector?: string | null
  type: string
  width: number | null
}

export interface ElementSizeSize {
  height: number
  width: number
}

export type ElementSizeType = {
  create(entity: ElementSizeEntity, payload: unknown, api: Api): void
  destroy(entity: ElementSizeEntity): void
  elementSizeChange(entity: ElementSizeEntity, size: ElementSizeSize): void
  elementSizeWatch(entity: ElementSizeEntity, payload: unknown, api: Api): void
  elementSizeUnwatch(entity: ElementSizeEntity): void
}

export declare const ElementSize: ElementSizeType
