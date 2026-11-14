export function isNative() {
  const capacitor = globalThis.Capacitor ?? globalThis.window?.Capacitor ?? null

  if (!capacitor) {
    return false
  }

  if (typeof capacitor.isNativePlatform === "function") {
    return capacitor.isNativePlatform()
  }

  if (typeof capacitor.getPlatform === "function") {
    return ["android", "ios"].includes(capacitor.getPlatform())
  }

  return capacitor.isNative === true
}
