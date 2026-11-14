---
title: App Updates
description: Live updates of the web code, and mandatory native updates
---

# App Updates

A mobile app with `--push` gets two kinds of updates, both on Supabase.

## Live updates

A store release is only needed for native changes. The web code inside the apps updates itself from a signed bundle in the public `live-updates` bucket: at launch, every hour and on each return to the foreground, the app downloads a newer bundle made for its build and switches to it the next time it goes to the background. A bundle that doesn't start within 10 seconds is rolled back and never downloaded again.

Once, before the first store build, make the signing keys:

```bash
pnpm live:keys
```

The private key goes to `~/.config/<app name>/live-update.pem`, or wherever `LIVE_UPDATE_PRIVATE_KEY` points: back it up, and never commit it. Whoever holds it can change the installed apps. The public key goes to `live-update.pub.pem`: commit it, since `capacitor.config.ts` builds it into the apps, which then refuse anything it didn't sign.

To publish, commit and run:

```bash
pnpm live:release
```

It builds the committed code from a clean checkout with the production values in `.env`, signs it and uploads it. To publish on every push to `main` that changes the app, call it from a pre-push hook:

```sh
printf '%s\n' "$(cat)" | pnpm exec inglorious-live-update release --on-push
```

Every release build is stamped with the time it was built, and an app only takes a newer bundle, so a store build never goes back. `liveUpdate.minBuild` in `package.json` is the oldest build a bundle runs on: raise it to the new build number whenever a release changes something native, such as a plugin, a permission or `capacitor.config.ts`. Development builds aren't stamped, so they never update themselves.

The API behind it is [`watchLiveUpdate`](https://inglorious.dev/web/featured/live-updates).

## Mandatory native updates

Each platform's row in the `app_versions` table holds the oldest build allowed to run: an older one shows nothing but an update page, at launch and whenever it comes back to the foreground.

Once a new build is live in a store, raise that platform's minimum to its build number:

```sql
update public.app_versions set min_build = 7 where platform = 'android';
```

Never before: users would be blocked with nothing to download. Set `store_url` to the store page, or the update page shows no button. A failed check keeps the last answer, so nobody is blocked for being offline.

Older builds keep talking to the backend until they are blocked, so a change that breaks them ships in two releases: a build that works with both backends, made mandatory, then the breaking change.

The API behind it is [`createNativeUpdate`](https://inglorious.dev/web/featured/native-updates).
