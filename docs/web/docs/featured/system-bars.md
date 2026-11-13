---
title: System Bars
description: "Status and navigation bars that follow the app's own light or dark theme"
---

# System Bars

The status bar and Android's navigation bar follow the device's light or dark mode, so a light app on a phone in dark mode gets white icons on a white page. `@inglorious/web/native/system-bars` sets them from the app's own `color-scheme`, which every Inglorious UI theme sets, and follows it when the theme class changes. An app whose `color-scheme` is `light dark` keeps the device's style. It does nothing outside a native app.

```javascript
import { SystemBars } from "@capacitor/core"
import { watchSystemBars } from "@inglorious/web/native/system-bars"

watchSystemBars(SystemBars)
```

It returns a function that stops following.
