/** What `haptics` needs of `Haptics` from `@capacitor/haptics`. */
export interface HapticsPlugin {
  impact(options: { style: "LIGHT" | "MEDIUM" | "HEAVY" }): Promise<void>
  notification(options: {
    type: "SUCCESS" | "WARNING" | "ERROR"
  }): Promise<void>
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
