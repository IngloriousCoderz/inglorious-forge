import { Api } from "../mount"

export interface NetworkStatusEntity {
  id: string | number
  type?: "NetworkStatus"
  isOnline: boolean
  isSupported: boolean
  isWatching: boolean
}

export interface NetworkStatusType {
  create(entity: NetworkStatusEntity, payload: unknown, api: Api): void
  destroy(entity: NetworkStatusEntity, payload: unknown, api: Api): void
  networkStatusChange(entity: NetworkStatusEntity, value: boolean): void
  networkStatusWatch(
    entity: NetworkStatusEntity,
    payload: unknown,
    api: Api,
  ): void
  networkStatusUnwatch(entity: NetworkStatusEntity): void
}

export declare const NetworkStatus: NetworkStatusType
