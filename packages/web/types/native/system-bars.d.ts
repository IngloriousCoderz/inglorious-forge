/** What `createSystemBars` needs of `SystemBars` from `@capacitor/core`. */
export interface SystemBarsPlugin {
  setStyle(options: { style: SystemBarsStyle }): Promise<void>
}

/** `SystemBarsStyle` from `@capacitor/core`: the colour of the background. */
export type SystemBarsStyle = "DARK" | "LIGHT" | "DEFAULT"

export interface SystemBarsConfig {
  plugin: SystemBarsPlugin
}

export interface SystemBarsEntity {
  id?: string
  type: string
  /** The bars' current style, or `null` outside a native app. */
  style: SystemBarsStyle | null
}

export type SystemBarsType = {
  create(entity: SystemBarsEntity): void
  destroy(entity: SystemBarsEntity): void
  systemBarsStyleChange(entity: SystemBarsEntity, style: SystemBarsStyle): void
}

/**
 * The type that keeps the status and navigation bars readable on the app's own
 * colours, as its `color-scheme` sets them, and follows theme changes. Does
 * nothing outside a native app.
 */
export declare function createSystemBars(
  config: SystemBarsConfig,
): SystemBarsType

/**
 * The bars' style for a `color-scheme` value: `"DARK"` on a dark-only page,
 * `"LIGHT"` on a light-only one, `"DEFAULT"` (the device's) otherwise.
 */
export declare function styleFor(colorScheme: string): SystemBarsStyle
