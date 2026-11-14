---
title: PWA
description: An installable app that keeps itself up to date
---

# PWA

| Question            | Flag                 |
| ------------------- | -------------------- |
| Enable PWA support? | `--pwa` / `--no-pwa` |

`--pwa` makes the web app installable, with [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/): a manifest, icons made from `public/logo` by `@vite-pwa/assets-generator`, and a service worker that caches the app for offline starts.

Installed apps stay on the latest version: when a new deployment is found, [`watchPwaUpdate`](https://inglorious.dev/web/featured/pwa-updates) from `@inglorious/web/pwa` switches to it. Inside the native apps the service worker stays off, since they update through the stores and [live updates](../mobile/updates.md).

`--push` turns PWA support on, and can't be combined with `--no-pwa`.
