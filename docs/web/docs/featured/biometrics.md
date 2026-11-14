---
title: Biometrics
description: "Unlocking with Face ID or a fingerprint, through the system's own prompt"
---

# Biometrics

`createBiometrics` from `@inglorious/web/device/biometrics` is the type behind "unlock with Face ID". In a native app, `verify` shows the system's biometric prompt through [`@capgo/capacitor-native-biometric`](https://github.com/Cap-go/capacitor-native-biometric), once you hand the plugin over. A browser has no equivalent, so there it is never available.

```javascript
import { NativeBiometric } from "@capgo/capacitor-native-biometric"
import { createBiometrics } from "@inglorious/web/device/biometrics"

const types = { Biometrics: createBiometrics({ plugin: NativeBiometric }) }
const entities = { biometrics: { type: "Biometrics" } }

api.notify("#biometrics:verify", { reason: "Unlock your account" })
```

- `isAvailable`: whether the device can verify, to hide the button otherwise.
- `biometryType`: `"face"`, `"fingerprint"`, `"iris"`, `"multiple"` or `"passcode"`, to name it.
- `result`: `"verified"` or `"cancelled"`. Closing the prompt is not an error.
- `status` and `error`: those of `handleRequest`, with `error` `"unavailable"` or `"failed"`.

On iOS, Face ID needs an `NSFaceIDUsageDescription` in `Info.plist`.
