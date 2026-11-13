---
title: Share
description: A share button that does what the device does best, from the system sheet to copying the link
---

# Share

`createShare` from `@inglorious/web/share` returns the type behind a share button. Its `share` event hands a title, a text, a link or a file to whatever the device does best, and the entity says what happened:

- in a native app, the system's share sheet, through [`@capacitor/share`](https://capacitorjs.com/docs/apis/share) when you hand it over as `plugin`;
- in a browser, a file (a `url` with a `fileName`) downloads, since a browser has nowhere better to put it;
- otherwise the browser's share sheet where there is one (Web Share API), else the link is copied.

## Setup

```javascript
import { Share } from "@capacitor/share"
import { createShare } from "@inglorious/web/share"

const types = { Share: createShare({ plugin: Share }) }
const entities = { share: { type: "Share" } }
```

Without `plugin`, the native app falls back to what a browser does.

## Sharing

```javascript
api.notify("#share:share", {
  title: "My job",
  url: "https://example.com/jobs/1",
})

// A file: a download in a browser, the share sheet in the app
api.notify("#share:share", {
  title: "Wedding",
  url: icsUrl,
  fileName: "wedding.ics",
})
```

## The entity

- `result`: `"shared"`, `"downloaded"`, `"copied"` or `"cancelled"`. Closing the sheet is not an error.
- `status` and `error`: those of [`handleRequest`](https://inglorious.dev/store/api/reference#handlerequest-eventname-handlers-options), with `error` `"unsupported"` (nothing can share here) or `"failed"`.
- `canShare`: whether a link can be shared at all, to hide the button where it can't. A file can always download.

```javascript
render(entity, api) {
  if (!entity.canShare) return ""
  return html`<button @click=${() => api.notify("#share:share", { url })}>
    ${entity.result === "copied" ? "Link copied" : "Share"}
  </button>`
}
```
