---
title: Push
description: Asking a device for push notifications and keeping it registered
---

# Push

`createPushPrompt` returns the type that asks a device for push notifications and keeps it registered. It knows nothing about the push service: an adapter does that part.

## Why a prompt of your own

A device shows its permission dialog only so many times, and a refusal there may be for good. So the type asks in the app's own words first. Its entity's `isOpen` is a prompt for the app to render. A yes brings up the system's dialog. A no is remembered on the device, so the prompt never comes back; allowing pushes later in the system's settings still registers the device.

## Setup

```javascript
import { createPushPrompt } from "@inglorious/web/push"

const prompt = createPushPrompt({ adapter: fcm })

const types = {
  PushPrompt: {
    ...prompt,
    // The app says when there is someone to register for.
    sessionStart: prompt.pushStart,
    sessionEnd: prompt.pushStop,
    render(entity, api) {
      if (!entity.isOpen) return ""
      return html`<p>
        Turn on notifications?
        <button @click=${() => api.notify("#pushPrompt:pushAsk")}>Yes</button>
        <button @click=${() => api.notify("#pushPrompt:pushDecline")}>
          Not now
        </button>
      </p>`
    },
  },
}

const entities = { pushPrompt: { type: "PushPrompt" } }
```

## Events

- `pushStart`: checks the permission. Granted, it registers the device; not yet answered, it opens the prompt. Send it at sign-in.
- `pushStop`: closes the prompt. Send it at sign-out.
- `pushAsk`: the prompt's yes. Notify it from the tap itself: a browser shows its dialog only within one.
- `pushDecline`: the prompt's no, remembered under `declineKey` in localStorage.

## Entity state

- `isOpen`: the prompt is showing.
- `isActive`: between `pushStart` and `pushStop`.

## The adapter

`@inglorious/firebase/push` has one for Firebase Cloud Messaging, in the browser and in Capacitor apps. Writing your own takes five functions:

```javascript
const fcm = {
  isSupported: async () => true,
  permission: async () => "granted", // or "denied", "prompt"
  request: () => Notification.requestPermission(), // first, before any await
  register: async () => {
    const token = await getToken()
    await saveToken(token)
  },
  // Optional: taps on pushes the system showed (native apps).
  onTap: (listener) => onNotificationTap((data) => listener(data.url)),
}
```

`register` runs at every start, so a token the service rotated is stored again. Unregistering belongs at sign-out, before the session ends, while the user can still delete their own token.

A tapped push's `url` opens with `#router:navigate`; pass `onTap(url, api)` to `createPushPrompt` to handle it differently. In a browser, taps are the service worker's.
