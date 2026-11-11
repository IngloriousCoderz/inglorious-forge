/** What `watchSystemBars` needs of `SystemBars` from `@capacitor/core`. */
export interface SystemBarsPlugin {
  setStyle(options: { style: SystemBarsStyle }): Promise<void>
}

/** `SystemBarsStyle` from `@capacitor/core`: the colour of the background. */
export type SystemBarsStyle = "DARK" | "LIGHT" | "DEFAULT"

/**
 * Keeps the status and navigation bars readable on the app's own colours, as
 * its `color-scheme` sets them, and follows theme changes. Does nothing
 * outside a native app.
 * @returns A function that stops following.
 */
export declare function watchSystemBars(
  systemBars: SystemBarsPlugin,
): () => void

/**
 * The bars' style for a `color-scheme` value: `"DARK"` on a dark-only page,
 * `"LIGHT"` on a light-only one, `"DEFAULT"` (the device's) otherwise.
 */
export declare function styleFor(colorScheme: string): SystemBarsStyle
