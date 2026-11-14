---
title: What is Create App?
description: What @inglorious/create-app generates, and the choices it makes for you
---

# What is Create App?

`@inglorious/create-app` scaffolds a new project on [Inglorious Web](https://inglorious.dev/web/): a web framework where state is a store of plain entities, everything that happens is an event, and the UI renders from it with lit-html, JSX or Vue templates.

```bash
pnpm create @inglorious/app
```

The same project runs as a website, an installable PWA and, through [Capacitor](https://capacitorjs.com), as native Android and iOS apps. Ask for the features you need and they arrive working together:

- **Inglorious UI** with six themes (Inglorious, Material UI, Material 3, Bootstrap, iOS 18, iOS 26), light and dark, icons and page transitions.
- **Routing**, **translations** and a language picker.
- **Sign-in** with Supabase Auth: passwords, codes by email, password reset and account deletion.
- **Analytics** behind a consent prompt, and **push notifications** on the web and in the native apps.
- **Mobile**: native settings written into the projects for you, live reload on a device, icons and splash screens from one logo, App Links, store listing images, release scripts, cloud builds, live updates and mandatory native updates.
- **Agent skills**, so coding agents write code the way the framework expects.

## Opinionated by design

Create App picks a stack so that every feature works on the first run, without a page of glue code:

| Need                          | Choice                                       |
| ----------------------------- | -------------------------------------------- |
| Native shell                  | Capacitor                                    |
| Sign-in, database, functions  | Supabase                                     |
| Analytics and push delivery   | Firebase (Google Analytics, Cloud Messaging) |
| Live updates and app versions | Supabase Storage and a Supabase table        |
| Hosting                       | Vercel (`vercel.json`)                       |
| CI                            | GitHub Actions and Dependabot                |
| Package manager               | pnpm                                         |
| Versions and changelog        | Changesets                                   |

The web app, the UI, routing, translations and the native project setup depend on none of these services. Sign-in, analytics, push and both kinds of updates do: **push and updates need Supabase and Firebase**. Each of them goes through a small adapter, so another backend means writing that adapter, not rewriting the app: see [Services It Uses](../backend/services.md) and [Bring Your Own Backend](../backend/bring-your-own.md).

## What it is not

- **Not a native UI toolkit.** The app is a web app in a native WebView. Inglorious UI's themes look and behave like the platform (iOS swipe back, the Android back button, safe areas, haptics), but it doesn't draw native widgets like React Native or Flutter do.
- **Not a hosted build service.** Cloud builds run on your own GitHub Actions minutes with your own signing keys.
- **Not a QR-code dev client.** There is no prebuilt app like Expo Go to scan into. [Live reload](../mobile/live-reload.md) installs your real app on the device once, then reloads it from your dev server.
