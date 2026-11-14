import type { AsyncEvents } from "@inglorious/store/async"

import { Api } from "../mount"

/** What `createBiometrics` needs of `NativeBiometric` from `@capgo/capacitor-native-biometric`. */
export interface BiometricsPlugin {
  isAvailable(): Promise<{ isAvailable: boolean; biometryType: number }>
  verifyIdentity(options?: BiometricsOptions): Promise<void>
}

/** What the system's prompt says. */
export interface BiometricsOptions {
  reason?: string
  title?: string
  subtitle?: string
  description?: string
}

export type BiometryType =
  "face" | "fingerprint" | "iris" | "multiple" | "passcode"

export interface BiometricsEntity {
  id?: string
  type: string
  isAvailable: boolean
  biometryType: BiometryType | null
  status: "idle" | "loading" | "success" | "error"
  error: "unavailable" | "failed" | null
  result: "verified" | "cancelled" | null
}

export type BiometricsType = {
  create(entity: BiometricsEntity, payload: unknown, api: Api): void
  biometricsAvailable(
    entity: BiometricsEntity,
    answer: { isAvailable: boolean; biometryType: number },
  ): void
} & AsyncEvents<
  "verify",
  BiometricsEntity,
  BiometricsOptions | undefined,
  BiometricsEntity["result"]
>

/**
 * The type behind "unlock with Face ID": the system's biometric prompt in a
 * native app; never available in a browser.
 */
export declare function createBiometrics(config?: {
  plugin?: BiometricsPlugin
}): BiometricsType
