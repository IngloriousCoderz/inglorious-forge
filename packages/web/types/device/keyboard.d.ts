/**
 * Sets `--iw-keyboard-height` on `<html>` to the height the on-screen keyboard
 * covers, and the `iw-keyboard-open` class while it is up, so what sits at the
 * bottom of the screen can move above it or step aside. Where the page shrinks
 * for the keyboard, the class is set and the height stays 0.
 * @returns A function that stops following.
 */
export declare function watchKeyboard(): () => void
