---
title: Keyboard
description: "Knowing when the on-screen keyboard is up, and keeping fixed elements above it"
---

# Keyboard

Phones don't shrink the page for the on-screen keyboard: iOS never does, nor does Chrome on Android. Whatever sits at the bottom of the screen ends up behind it. The `Keyboard` type reads the height the keyboard covers from the visual viewport into its entity, and sets it as `--iw-keyboard-height` on `<html>`, with the `iw-keyboard-open` class while the keyboard is up. It needs no plugin and works in browsers and native apps alike.

```javascript
import { Keyboard } from "@inglorious/web/device/keyboard"

const types = { Keyboard }
const entities = { keyboard: { type: "Keyboard" } }
```

The entity holds `isSupported`, `isOpen` and `height`. Where the page does shrink for the keyboard, as in an Android app, `isOpen` is still set but `height` stays `0`, since nothing is covered.

Inglorious UI's bottom sheets, snackbars and toasts move above the keyboard, and its bottom navigation hides while the keyboard is up. Your own fixed elements can do the same:

```css
.composer {
  position: fixed;
  bottom: var(--iw-keyboard-height, 0px);
}
```
