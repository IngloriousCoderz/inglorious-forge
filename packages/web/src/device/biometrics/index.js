import { handleRequest } from "@inglorious/store/async"

import { isNative } from "../../native/index.js"

const UNAVAILABLE = "unavailable"
const FAILED = "failed"
const USER_CANCEL = 16
const TYPES = {
  1: "fingerprint",
  2: "face",
  3: "fingerprint",
  4: "face",
  5: "iris",
  6: "multiple",
  7: "passcode",
}

/**
 * The type behind "unlock with Face ID": `verify` shows the system's
 * biometric prompt through `NativeBiometric` from
 * `@capgo/capacitor-native-biometric`, given as `plugin`, in a native app.
 *
 * `isAvailable` says whether the device can verify, to hide the button
 * otherwise, and `biometryType` (`"face"`, `"fingerprint"`, `"iris"`,
 * `"multiple"` or `"passcode"`) to name it. `result` is `"verified"` or
 * `"cancelled"`: closing the prompt is not an error. `status` and `error`
 * (`"unavailable"` or `"failed"`) are those of `handleRequest`. A browser has
 * no equivalent: there it is never available.
 *
 * @param {{ plugin?: object }} [config]
 *
 * @example
 * import { NativeBiometric } from "@capgo/capacitor-native-biometric"
 * const types = { Biometrics: createBiometrics({ plugin: NativeBiometric }) }
 * api.notify("#biometrics:verify", { reason: "Unlock your account" })
 */
export function createBiometrics({ plugin } = {}) {
  const device = plugin && isNative() ? plugin : null

  return {
    create(entity, _, api) {
      const { id } = entity
      entity.isAvailable ??= false
      entity.biometryType ??= null
      entity.status ??= "idle"
      entity.error ??= null
      entity.result ??= null
      device
        ?.isAvailable()
        .then((answer) => api.notify(`#${id}:biometricsAvailable`, answer))
    },

    biometricsAvailable(entity, { isAvailable, biometryType }) {
      entity.isAvailable = isAvailable
      entity.biometryType = TYPES[biometryType] ?? null
    },

    ...handleRequest(
      "verify",
      {
        start(entity) {
          entity.result = null
        },
        run: (options) => verify(device, options),
        success(entity, result) {
          entity.result = result
        },
      },
      {
        toError: (error) =>
          error?.message === UNAVAILABLE ? UNAVAILABLE : FAILED,
      },
    ),
  }
}

async function verify(device, options = {}) {
  if (!device) throw new Error(UNAVAILABLE)
  try {
    await device.verifyIdentity(options)
    return "verified"
  } catch (error) {
    if (Number(error?.code) === USER_CANCEL) return "cancelled"
    throw error
  }
}
