import type { AsyncEvents } from "@inglorious/store/async"

import { Api } from "../mount"

export interface NativeUpdateRequirement {
  /** The oldest build allowed to run. */
  minBuild: number
  /** Where the update button sends users; none hides it. */
  storeUrl?: string | null
}

/** Where the minimum build of each platform lives. */
export interface NativeUpdateAdapter {
  /** The platform's minimum, or `null` for none. */
  requirement(
    platform: "android" | "ios",
  ): Promise<NativeUpdateRequirement | null>
}

/** What `createNativeUpdate` needs of `App` from `@capacitor/app`. */
export interface NativeUpdatePlugin {
  getInfo(): Promise<{ build: string }>
  addListener(
    event: "resume",
    listener: () => void,
  ): Promise<{ remove(): Promise<void> }>
}

export interface NativeUpdateConfig {
  adapter: NativeUpdateAdapter
  /** Checks the installed build at launch and on every resume, in a native app. */
  plugin?: NativeUpdatePlugin
}

export interface NativeUpdateEntity {
  id?: string
  type: string
  /** The installed build is below the minimum. */
  isUpdateRequired: boolean
  storeUrl: string | null
}

export interface NativeUpdateCheckPayload {
  platform: "android" | "ios"
  build: number
}

export type NativeUpdateType = {
  create(entity: NativeUpdateEntity): void
  destroy(entity: NativeUpdateEntity): void
  /** Compares the installed build with the platform's minimum. */
  nativeUpdateCheck(
    entity: NativeUpdateEntity,
    payload: NativeUpdateCheckPayload,
    api?: Api,
  ): void
  /** Opens the store. */
  nativeUpdateApply(entity: NativeUpdateEntity): void
} & AsyncEvents<
  "nativeUpdateCheck",
  NativeUpdateEntity,
  NativeUpdateCheckPayload,
  { build: number; requirement: NativeUpdateRequirement | null }
>

/** The type that blocks a native build older than the minimum allowed. */
export declare function createNativeUpdate(
  config: NativeUpdateConfig,
): NativeUpdateType
