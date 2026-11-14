---
title: Versions and Releases
description: How a generated app is versioned and released
---

# Versions and Releases

Every `js` and `ts` app is versioned with [Changesets](https://github.com/changesets/changesets):

1. Describe each change as you make it with `pnpm changeset`.
2. When a release is due, `pnpm release:version` raises the version in `package.json` and writes `CHANGELOG.md`.

The app reads its version as `import.meta.env.VITE_APP_VERSION`, which `vite.config` takes from `package.json`.

## The web

Push to `main`: Vercel deploys it, as `vercel.json` allows only that branch. An installed PWA picks up the new version by itself ([PWA](../features/pwa.md)).

## The native apps

The version users see is the same on the web, Android and iOS. The build number is shared by both native apps and goes up with every store upload. `pnpm mobile:release` copies the version into both native projects, raises the build number, builds with the production values in `.env` and syncs.

Then upload from Xcode and Android Studio, or let [Cloud Builds](../mobile/ci.md) do it. See [Releasing to the Stores](../mobile/releasing.md).

Web code changes reach installed apps without the stores, through [live updates](../mobile/updates.md).
