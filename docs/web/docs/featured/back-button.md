---
title: Back Button
description: "Android's back button and gesture, closing the app on top-level pages"
---

# Back Button

On Android, the back button and the back gesture go back in history. The `BackButton` type closes the app instead on a root path, a top-level page like a tab bar's, and when there is no history left, as other Android apps do. It does nothing outside a native app, and iOS has no back button.

```javascript
import { App } from "@capacitor/app"
import { createBackButton } from "@inglorious/web/native/back-button"

const types = { BackButton: createBackButton({ plugin: App }) }
const entities = {
  backButton: { type: "BackButton", rootPaths: ["/", "/search", "/profile"] },
}
```

`rootPaths` defaults to `["/"]`. Navigate between root paths with `{ to, replace: true }`, so switching tabs does not pile up history.
