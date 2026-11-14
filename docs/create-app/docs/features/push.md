---
title: Push Notifications
description: Push on the web and in the native apps, sent from Supabase
---

# Push Notifications

| Question                | Flag                   |
| ----------------------- | ---------------------- |
| Add push notifications? | `--push` / `--no-push` |

`--push` delivers pushes to the PWA and, with `--mobile`, to the native apps, through Firebase Cloud Messaging. Supabase keeps each device's token and sends: inserting a row in `notifications` is what sends a push.

```sql
insert into public.notifications (user_id, title, body, url)
values ('<user id>', 'Hello', 'You have a new message', '/');
```

It generates a Supabase migration, the `push-notify` Edge Function, a service worker for web pushes and a permission prompt. Push turns on [PWA](./pwa.md) support, since web pushes need its service worker, and with `--mobile` it also brings [live and mandatory native updates](../mobile/updates.md).

The permission prompt appears once someone is signed in, since a token belongs to a user: use it with [`--auth`](./auth.md). Declining is remembered on the `pushPrompt` entity. To sign out, call `signOut` from `src/api/push`, which deletes the device's token first.

## Setup

With a Firebase project as in [Analytics](./analytics.md) and the [Supabase CLI](https://supabase.com/docs/guides/cli):

1. `VITE_FIREBASE_VAPID_KEY` is the public half of a Web Push key pair, from **Project settings → Cloud Messaging → Web configuration**.
2. In the Firebase console, go to **Project settings → Service accounts → Generate new private key**. The file is a real secret: never commit it.
3. In the Google Cloud console, give that service account the **Firebase Cloud Messaging API Admin** role. The similarly named Firebase Cloud Messaging Admin cannot send.
4. `supabase init`, then `supabase start` to try it locally, with the file's JSON on one line as `FCM_SERVICE_ACCOUNT` in `supabase/functions/.env`.

To deploy:

```bash
supabase link --project-ref <your project ref>
supabase db push
supabase secrets set FCM_SERVICE_ACCOUNT="$(cat path/to/service-account.json)"
supabase functions deploy push-notify
pnpm vault:push
```

`pnpm vault:push` tells the database how to reach the function, storing the project's `service_role` key in Vault.

A browser's service worker only exists in a build, so try web pushes with `pnpm build && pnpm preview`. The API behind it is [`createPushPrompt`](https://inglorious.dev/web/featured/push).
