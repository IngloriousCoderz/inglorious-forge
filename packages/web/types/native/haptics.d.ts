/**
 * What `haptics` needs of `Haptics` from `@capacitor/haptics`, whose options
 * take its `ImpactStyle` and `NotificationType` enums: `"LIGHT"`, `"MEDIUM"`,
 * `"HEAVY"` and `"SUCCESS"`, `"WARNING"`, `"ERROR"`.
 */
export interface HapticsPlugin {
  impact(options?: { style?: string }): Promise<void>
  notification(options?: { type?: string }): Promise<void>
}

/**
 * Taps the user can feel: the system's haptics in a native app, a vibration
 * where the browser can, nothing elsewhere. Each call returns whether it
 * played.
 */
export declare const haptics: {
  /** Plays the system's haptics in a native app. */
  use(haptics: HapticsPlugin | null): void
  /** A choice changed, such as a toggle flipped or a threshold crossed. */
  selection(): boolean
  /** Something hit, harder the heavier the style. */
  impact(style?: "light" | "medium" | "heavy"): boolean
  /** The outcome of an action. */
  notification(type?: "success" | "warning" | "error"): boolean
}
