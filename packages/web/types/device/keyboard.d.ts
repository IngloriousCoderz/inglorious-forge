export interface KeyboardEntity {
  id?: string
  type: string
  /** The page has a visual viewport to read the keyboard from. */
  isSupported: boolean
  /** The on-screen keyboard is up. */
  isOpen: boolean
  /** How much of the page the keyboard covers, in pixels: 0 where the page shrinks for it. */
  height: number
}

export interface KeyboardChange {
  isOpen: boolean
  height: number
}

export type KeyboardType = {
  create(entity: KeyboardEntity): void
  destroy(entity: KeyboardEntity): void
  keyboardChange(entity: KeyboardEntity, change: KeyboardChange): void
}

/**
 * The type that knows when the on-screen keyboard is up and how much of the
 * page it covers, setting `--iw-keyboard-height` on `<html>` and the
 * `iw-keyboard-open` class so fixed elements can move above it.
 */
export declare const Keyboard: KeyboardType
