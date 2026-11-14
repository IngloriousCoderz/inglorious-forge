---
title: UI, Themes and Icons
description: Inglorious UI, its themes and the icon packs
---

# UI, Themes and Icons

| Question           | Flag                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| Use Inglorious UI? | `--ui` / `--no-ui`                                                       |
| Which theme?       | `--theme=inglorious\|material-ui\|material-3\|bootstrap\|ios-18\|ios-26` |
| Which icon packs?  | `--icons=material,fontawesome,lucide` / `--no-icons`                     |

`--ui` adds [Inglorious UI](https://inglorious.dev/ui/): its base styles, the chosen theme's stylesheet, an app bar and toasts. Any code can show a toast:

```js
api.notify("#toast:show", { message: "Saved", color: "success" })
```

It also calls `watchKeyboard`, which keeps the focused input above the on-screen keyboard.

## Themes

| Theme         | Looks like               |
| ------------- | ------------------------ |
| `inglorious`  | Neon, videogame-inspired |
| `material-ui` | Material UI              |
| `material-3`  | Material Design 3        |
| `bootstrap`   | Bootstrap                |
| `ios-18`      | Flat iOS                 |
| `ios-26`      | Liquid Glass             |

Every theme has a light and a dark mode that follow the system. Themes are CSS: switching later means changing the theme import in `src/main` and the `iw-theme-*` class on `<body>` in `index.html`.

## Mobile layout

With `--mobile`, the app gets a bottom tab bar instead of links in the app bar, and spacing that keeps clear of the notch and the home indicator. See [Native Features](../mobile/native-features.md) for swipe back, the back button, system bars and haptics.

## Icons

Icons come from [Iconify](https://iconify.design) sets, drawn by Inglorious UI's `Icon`, and only the icons you import end up in the build:

| Pack             | Flag value    |
| ---------------- | ------------- |
| Material Symbols | `material`    |
| Font Awesome     | `fontawesome` |
| Lucide           | `lucide`      |

The navigation uses the first pack you pick. Icons need `--ui`.
