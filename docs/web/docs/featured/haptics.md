---
title: Haptics
description: "Taps the user can feel, through the system's haptics or the browser's vibration"
---

# Haptics

`@inglorious/web/native/haptics` plays taps the user can feel. In a native app it uses the system's haptics through [`@capacitor/haptics`](https://capacitorjs.com/docs/apis/haptics), once you hand the plugin over. Elsewhere it vibrates where the browser can (Chrome on Android), once the user has tapped the page; iOS browsers stay silent. Every call returns whether it played.

```javascript
import { Haptics } from "@capacitor/haptics"
import { haptics } from "@inglorious/web/native/haptics"

haptics.use(Haptics)

haptics.selection() // a toggle flipped, a threshold crossed
haptics.impact("heavy") // "light", "medium" (default) or "heavy"
haptics.notification("error") // "success" (default), "warning" or "error"
```

Inglorious UI plays them too: `PullToRefresh` gives a tick when letting go would refresh.
