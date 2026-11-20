---
title: Project Structure
description: Where things live in a generated app
---

# Project Structure

A `ts` project with routing, sign-in, push and mobile looks like this (a `js` project has `.js` files and no `types/`):

```text
my-app/
├── .changeset/              # change descriptions for the next release
├── .github/
│   ├── dependabot.yml       # weekly, grouped dependency updates
│   └── workflows/
│       └── store-release.yml   # with --ci
├── public/
│   ├── logo.png             # the icon, splash screen and PWA icons start here
│   └── sw-push.js           # with --push
├── src/
│   ├── main.ts              # mounts the app and starts the watchers
│   ├── app/                 # the shell and its pieces
│   │   ├── index.ts         # app bar, navigation, the current page
│   │   ├── auth/            # sign-in screen
│   │   ├── analytics/       # consent prompt
│   │   ├── push-prompt/
│   │   └── native-update/   # the page an outdated build shows
│   ├── views/               # one folder per page, with routing
│   │   ├── home/            # message/index.test.ts: the first test
│   │   └── about/
│   ├── api/                 # Supabase, Firebase, auth and push clients
│   ├── common/              # shared code
│   ├── i18n/                # translations, one JSON file per language
│   └── store/               # types, entities, routes, middlewares
├── supabase/
│   ├── functions/           # erase-account, push-notify
│   ├── migrations/
│   └── templates/           # sign-in emails with codes
├── types/                   # type definitions only
├── capacitor.config.ts      # with --mobile
├── listing.config.js        # store screenshots, with --mobile
├── vercel.json
└── package.json             # scripts, and "native" settings with --mobile
```

Without routing, the single page is `src/app/home/`. There is no `scripts/` folder: tasks such as raising the build number or pushing secrets are commands of the Forge packages (`inglorious-capacitor`, `inglorious-supabase`), so they get fixes with the dependencies. `android/` and `ios/` appear once you create them with `pnpm mobile:init:android` and `pnpm mobile:init:ios`; commit them.

## How the app starts

`src/main` mounts the store and decides what to render: the update page if the native build is too old, nothing until the saved session is read, the sign-in screen until someone signs in, then the app. It also starts the watchers each feature needs: the keyboard, the system bars, App Links, the back button, live updates.

`src/store` registers every type and creates an entity for each type that has none (`autoCreateEntities`), so a page, the router or the sign-in screen each have their entity without listing it.

## Edge Functions

Sign-in and push add Edge Functions in `supabase/functions/`. `supabase start` already serves them. While editing one, `pnpm edge` serves them with their logs in the terminal, reloading on every save, and `pnpm edge:check` type-checks and lints them with Deno. Its first run writes `supabase/functions/deno.lock`: commit it, so every machine and deploy uses the same dependency versions.

## Tests

Every `js` and `ts` project has Vitest. `vitest.config` builds on `vite.config`, so tests see the app as Vite builds it, and splits them in two:

- **Unit tests**, `*.test.*`: `pnpm test` runs them once, `pnpm test:watch` on every save. They need nothing running; with Supabase, they get a placeholder address, so a fresh clone or CI needs no `.env.local`.
- **Integration tests**, `*.integration.test.*`: `pnpm test:integration`, against a real backend such as the local Supabase stack.

With translations, `src/testing/setup` waits for them before the tests run. The first test, beside the example Message type, runs its `click` handler with `trigger` from `@inglorious/web/test`: handlers are plain functions from an entity to a changed entity, so most tests need no browser.

## Types

`types/index.d.ts` declares `AppEntity`, `AppState`, `AppApi`, `AppEvents` and a type alias per type, written `export const Message: MessageType = { ... }`. A new entity type goes into `AppEntity`, `AppState` and `AppEvents`.

The project keeps two TypeScripts side by side: `typescript` (version 6) for the tools that need its API, such as ESLint, and `@typescript/native` (version 7) for fast type checks. Keep both.

The code follows the conventions of the [`web-best-practices`](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/docs/forge/.well-known/agent-skills/web-best-practices) skill: kebab-case paths, one folder per component, types in `types/`.
