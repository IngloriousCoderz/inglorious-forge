---
title: Scripts
description: The package.json scripts a generated app has
---

# Scripts

## Every Vite app

| Script                 | What it does                                 |
| ---------------------- | -------------------------------------------- |
| `pnpm dev`             | Starts the dev server                        |
| `pnpm build`           | Builds the app into `dist/`                  |
| `pnpm preview`         | Serves the build, with its service worker    |
| `pnpm lint`            | Lints                                        |
| `pnpm format`          | Formats with Prettier                        |
| `pnpm changeset`       | Describes a change for the next release      |
| `pnpm release:version` | Raises the version and writes `CHANGELOG.md` |

## With `--mobile`

| Script                       | What it does                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `pnpm mobile:init:android`   | Creates `android/`, with icons and splash screens                                                                  |
| `pnpm mobile:init:ios`       | Creates `ios/`, with icons and splash screens                                                                      |
| `pnpm mobile:sync`           | Builds and copies the app into both native projects, applying the [native settings](../mobile/native-settings.md)  |
| `pnpm mobile:android`        | Builds, syncs and runs on Android                                                                                  |
| `pnpm mobile:ios`            | Builds, syncs and runs on iOS                                                                                      |
| `pnpm mobile:dev:android`    | Runs on Android with [live reload](../mobile/live-reload.md)                                                       |
| `pnpm mobile:dev:ios`        | Runs on iOS with live reload                                                                                       |
| `pnpm mobile:assets`         | Makes [icons and splash screens](../mobile/assets.md) from the logo                                                |
| `pnpm mobile:listing-assets` | Makes [store screenshots and promotional images](../mobile/listing-assets.md)                                      |
| `pnpm mobile:release`        | Copies the version, raises the build number, builds for production and syncs ([Releasing](../mobile/releasing.md)) |
| `pnpm build:release`         | Builds with `.env`, ignoring `.env.local`                                                                          |
| `pnpm cap`                   | The Capacitor CLI                                                                                                  |

## With `--push`

| Script            | What it does                                               |
| ----------------- | ---------------------------------------------------------- |
| `pnpm vault:push` | Tells the database how to reach the `push-notify` function |

## With `--mobile --push`

| Script              | What it does                                                     |
| ------------------- | ---------------------------------------------------------------- |
| `pnpm live:keys`    | Makes the [live update](../mobile/updates.md) signing keys, once |
| `pnpm live:release` | Builds, signs and publishes a live update                        |
