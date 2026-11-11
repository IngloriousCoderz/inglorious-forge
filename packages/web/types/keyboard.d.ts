/**
 * Sets `--iw-keyboard-height` on `<html>` to the height the on-screen keyboard
 * covers, and the `iw-keyboard-open` class while it is up, so what sits at the
 * bottom of the screen can move above it.
 * @returns A function that stops following.
 */
export declare function watchKeyboard(): () => void
