---
title: Getting Started
description: Create, install and run a new Inglorious Web project
---

# Getting Started

## Prerequisites

- **Node.js** 26 or later
- **pnpm**
- For mobile apps: Android Studio, a JDK and, on a Mac, Xcode. See [Mobile Overview](../mobile/overview.md).

## Create a project

```bash
pnpm create @inglorious/app
```

The CLI asks for:

1. The project's name.
2. A [template](./templates.md): `minimal`, `js`, `ts`, `ssx-js` or `ssx-ts`.
3. A rendering syntax: lit-html, JSX or Vue.
4. For the `js` and `ts` templates, the app's features: UI and theme, mobile, cloud builds, routing, page transitions, icons, languages, analytics, sign-in, push and PWA.
5. Whether to install agent skills for coding agents.

Then:

```bash
cd my-app
pnpm install
pnpm dev
```

The generated `README.md` holds the setup steps for exactly the features you chose: the Firebase and Supabase projects to create, the values for `.env.local`, the native toolchains, and how to release.

## Without prompts

Every question has a flag, and a question answered by a flag is skipped. Answer all of them to create a project in one go, for example in a script or from a coding agent:

```bash
pnpm create @inglorious/app my-app --template=ts --syntax=jsx \
  --ui --theme=material-3 --routing --transitions --icons=material \
  --languages=en,it --no-mobile --no-analytics --no-auth --no-push --no-pwa \
  --skills
```

A mobile app with sign-in, push and cloud builds:

```bash
pnpm create @inglorious/app my-app --template=ts --syntax=lit-html \
  --ui --theme=ios-26 --mobile --ci --routing --transitions --icons=material \
  --no-i18n --no-analytics --auth --auth-methods=password,code --push \
  --skills
```

Every flag is listed in [Options](../reference/options.md).

## What every project gets

- A `vercel.json` that deploys only the `main` branch on Vercel; change `main` there if your production branch has another name.
- Except `minimal`:
  - `.github/dependabot.yml`, which opens weekly dependency updates grouped into two pull requests: one for `@inglorious/*`, one for everything else.
  - A `pnpm-workspace.yaml` that takes `@inglorious/*` packages the day they are published, past pnpm's minimum release age, and allows Firebase's install scripts when the app uses Firebase.
- In the `js` and `ts` templates, [versions and a changelog](./releases.md) with Changesets.
