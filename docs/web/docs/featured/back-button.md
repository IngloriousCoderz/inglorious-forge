---
title: Back Button
description: "Android's back button and gesture, closing the app on top-level pages"
---

# Back Button

On Android, the back button and the back gesture go back in history. `@inglorious/web/back-button` closes the app instead on a root path, a top-level page like a tab bar's, and when there is no history left, as other Android apps do. It does nothing outside a native app, and iOS has no back button.

```javascript
import { App } from "@capacitor/app"
import { watchBackButton } from "@inglorious/web/back-button"

watchBackButton(App, { rootPaths: ["/", "/search", "/profile"] })
```

`rootPaths` defaults to `["/"]`; it returns a function that stops listening. Navigate between root paths with `{ to, replace: true }`, so switching tabs does not pile up history.
