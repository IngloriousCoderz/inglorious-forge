---
title: Analytics
description: Measuring how an app is used, once the user agreed
---

# Analytics

`createAnalytics` returns the type that measures how an app is used: page views on every route change, and the app's own events. It measures nothing until the user agrees. An adapter talks to the analytics service.

## Consent first

In the EU, and in a growing number of other places, analytics needs the user's consent before it starts. In a browser, the first call to an analytics library is what sets its cookies and sends its first hit. So the type tells the adapter nothing until the user said yes.

Its entity's `consent` is `"granted"`, `"denied"`, or `null` when the user hasn't answered yet. The answer is remembered on the device. While `isAsking` is true, the app renders its own consent prompt.

## Setup

```javascript
import { createAnalytics } from "@inglorious/web/analytics"

const types = {
  Analytics: [
    createAnalytics({ adapter }),
    {
      render(entity, api) {
        if (!entity.isAsking) return ""
        return html`<p>
          May we measure how you use the app?
          <button
            @click=${() => api.notify("#analytics:analyticsConsent", true)}
          >
            Yes
          </button>
          <button
            @click=${() => api.notify("#analytics:analyticsConsent", false)}
          >
            No
          </button>
        </p>`
      },
    },
  ],
}

const entities = { analytics: { type: "Analytics" } }
```

The router's `routeChange` broadcast is all it needs for page views: there is nothing to add to the pages.

## Events

- `analyticsConsent`: the prompt's answer, `true` or `false`. Granted, the page the answer came from is the first one measured.
- `analyticsAsk`: brings the prompt back, for a settings page. Changing the choice should be as easy as making it.
- `analyticsTrack`: one of the app's own events, as `{ name, params }`. Ignored without consent.
- `routeChange`: from the router; a page view once granted.

```javascript
api.notify("#analytics:analyticsTrack", {
  name: "sign_up",
  params: { method: "email" },
})
```

## Entity state

- `consent`: `"granted"`, `"denied"` or `null`.
- `isAsking`: the consent prompt is showing.

## The adapter

`@inglorious/firebase/analytics` has one for Google Analytics for Firebase, in the browser and in Capacitor apps. Writing your own takes three functions:

```javascript
const adapter = {
  setConsent: (isGranted) => {}, // start or stop measuring
  pageView: ({ route, path }) => {}, // one page or screen
  event: (name, params) => {}, // one of the app's own events
}
```

An adapter whose library already counts history changes as page views, as Google Analytics does in a browser, can leave `pageView` empty. A failing adapter never reaches the app.
