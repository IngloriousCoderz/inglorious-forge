---
title: Keyboard
description: "Keeping fixed elements above the on-screen keyboard"
---

# Keyboard

Phones don't shrink the page for the on-screen keyboard: iOS never does, nor does Chrome on Android. Whatever sits at the bottom of the screen, such as a bottom sheet with an input, ends up behind it. `@inglorious/web/keyboard` reads the height the keyboard covers from the visual viewport and sets it as `--iw-keyboard-height` on `<html>`, with the `iw-keyboard-open` class while the keyboard is up. It needs no plugin and works in browsers and native apps alike. Where the page does shrink for the keyboard, as in an Android app, the class is still set but the height stays `0px`, since nothing is covered.

```javascript
import { watchKeyboard } from "@inglorious/web/keyboard"

watchKeyboard()
```

Inglorious UI's bottom sheets, snackbars and toasts move above the keyboard, and its bottom navigation hides while the keyboard is up. Your own fixed elements can do the same:

```css
.composer {
  position: fixed;
  bottom: var(--iw-keyboard-height, 0px);
}
```

It returns a function that stops following.
