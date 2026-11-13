---
title: App Links
description: "Opening the installed app from links to its domain"
---

# App Links

With Universal Links (iOS) and App Links (Android), a link to the app's domain opens the installed app instead of the browser. `@inglorious/web/app-links` sends the router to that link's path, both for the link that started the app and for links that arrive while it runs. It does nothing outside a native app.

```javascript
import { App } from "@capacitor/app"
import { watchAppLinks } from "@inglorious/web/app-links"

watchAppLinks(App, store)
```

`{ id }` as a third argument notifies a router with another id; it returns a function that stops listening.

The operating system opens the app only when the domain vouches for it: iOS reads `/.well-known/apple-app-site-association` and Android `/.well-known/assetlinks.json`, and the app declares the domain (Associated Domains on iOS, an intent filter on Android). [`@inglorious/capacitor`](https://www.npmjs.com/package/@inglorious/capacitor) generates all of it from `native.appLinks` in `package.json`, and `@inglorious/create-app --mobile` sets it up.
