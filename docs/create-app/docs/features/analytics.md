---
title: Analytics
description: Google Analytics for Firebase behind a consent prompt
---

# Analytics

| Question                             | Flag                             |
| ------------------------------------ | -------------------------------- |
| Add analytics with a consent prompt? | `--analytics` / `--no-analytics` |

`--analytics` measures usage with Google Analytics for Firebase, on the web and in the native apps, and only for people who said yes: until then, no analytics code loads. The answer is kept on the `analytics` entity and saved with `withStorage`, so the prompt appears once.

Page views follow the router by themselves. The app's own events go through the entity, and are dropped without consent:

```js
api.notify("#analytics:analyticsTrack", { name: "sign_up" })
```

To let people change their answer, for example from a settings page, notify `#analytics:analyticsAsk` to bring the prompt back.

## Setup

1. Create a project in the [Firebase console](https://console.firebase.google.com) and add a web app.
2. Copy `.env.example` to `.env.local` and fill it in from **Project settings → General → your web app**. These values end up in the built app, so they are not secret. `VITE_FIREBASE_MEASUREMENT_ID` is the web app's `measurementId`.
3. For mobile apps, add an Android and an iOS app too, and put `google-services.json` and `GoogleService-Info.plist` in the project's root: `pnpm mobile:sync` copies them into the native projects.

Don't paste Google's `gtag.js` snippet into `index.html`: it would start before anyone agreed.

## In the native apps

The native apps start with collection off, or they would measure from launch. `inglorious-capacitor configure` writes that setting into both projects, and removes the advertising ID permission Firebase adds to the Android app: answer "No" to Play Console's advertising ID question.

Check that your privacy policy covers analytics, naming Google as the processor. The API behind it is [`createAnalytics`](https://inglorious.dev/web/featured/analytics).
