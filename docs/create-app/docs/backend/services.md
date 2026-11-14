---
title: Services It Uses
description: Which features need which service, and what each one costs you
---

# Services It Uses

Create App is opinionated: the features that need a server use **Supabase** and **Firebase**, and the project deploys to **Vercel**. That keeps every feature working on the first run. Here is exactly what depends on what.

| Feature                                                                      | Supabase                       | Firebase         | Vercel                                      |
| ---------------------------------------------------------------------------- | ------------------------------ | ---------------- | ------------------------------------------- |
| UI, routing, translations, PWA                                               |                                |                  |                                             |
| Native projects, live reload, assets, listing images, releases, cloud builds |                                |                  |                                             |
| Sign-in (`--auth`)                                                           | Auth, an Edge Function         |                  |                                             |
| Analytics (`--analytics`)                                                    |                                | Google Analytics |                                             |
| Push (`--push`)                                                              | Database, Edge Function, Vault | Cloud Messaging  |                                             |
| Live updates (`--mobile --push`)                                             | Storage                        |                  |                                             |
| Mandatory native updates (`--mobile --push`)                                 | Database                       |                  |                                             |
| App Links                                                                    |                                |                  | Serves `.well-known` as JSON (any host can) |
| Deploys                                                                      |                                |                  | `vercel.json`                               |

Without `--auth`, `--analytics` and `--push`, a project depends on no service at all.

## Why these

- **Supabase** is Postgres with sign-in, row-level security, storage, realtime and Edge Functions, and it runs entirely on your machine with `supabase start`. Everything generated works against the local stack first, and it's open source: you can host it yourself.
- **Firebase Cloud Messaging** is the one way to reach Android devices, and the simplest way to reach iOS and the web with the same token format. Google Analytics for Firebase covers the web and both native apps with one dashboard.
- **Vercel** deploys a static Vite build with headers and rewrites from one file. Any static host works: move the headers in `vercel.json` to your host's format.

## Free tiers

All three have free tiers that cover development and small apps. Check their current limits before you launch; the costs that grow with users are Supabase's database and storage, and Vercel's bandwidth.

## Using something else

Each service sits behind a small adapter, so the app doesn't know which backend it talks to. See [Bring Your Own Backend](./bring-your-own.md).
