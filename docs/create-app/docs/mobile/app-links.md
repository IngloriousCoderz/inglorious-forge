---
title: Opening Links in the App
description: Universal Links and App Links, generated from package.json
---

# Opening Links in the App

With routing, a link to the app's domain opens the installed app instead of the browser, and the router goes to the link's path, through [`watchAppLinks`](https://inglorious.dev/web/featured/app-links). Fill in `native.appLinks.domain`, then:

1. **iOS**: set `native.ios.teamId`. `pnpm mobile:sync` adds the domain to the app's Associated Domains and writes `public/.well-known/apple-app-site-association`. Links in `native.appLinks.exclude` stay in the browser: by default, the ones carrying a sign-in token.
2. **Android**: add the SHA-256 fingerprints of the keys that sign the app to `native.android.sha256`: Google's app signing key and your upload key, both under **Test and release → App integrity → App signing** in Play Console. `pnpm mobile:sync` writes `public/.well-known/assetlinks.json` and the intent filter. Android can't exclude a link: it opens the paths in `native.appLinks.paths`, `["/*"]` by default, so list the ones that should open the app, such as `["/", "/jobs*"]`.
3. **Deploy** the site, so the domain serves both files. `vercel.json` already serves them as JSON.

```json
"native": {
  "appLinks": {
    "domain": "app.example.com",
    "paths": ["/", "/jobs*"],
    "exclude": ["#*access_token*", "/onboarding*"]
  }
}
```

Patterns end in `*` to match a prefix: `/jobs*` is every path that starts with `/jobs`. `exclude` takes paths and, starting with `#`, fragments.

Test on a device by tapping a link in Notes or Messages; typing it in Safari doesn't count. Both files are cached, so a change can take a few hours to arrive, and Android checks the domain when the app is installed or updated: `adb shell pm get-app-links <app id>` should say `verified`.
