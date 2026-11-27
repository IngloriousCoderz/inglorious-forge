---
name: app-recipe
description: The recipe for building and shipping an Inglorious Forge app on Supabase - accounts, scaffolding choices, build order, local-first backend, database rules, deploy, store releases and docs. Load when starting a new app, or when deploying or releasing one.
---

# App Recipe

The path a Forge app takes from idea to stores, with Supabase as backend and Vercel as host. Package details live in [create-app](../create-app/SKILL.md), [supabase](../supabase/SKILL.md), [firebase](../firebase/SKILL.md) and [web](../web/SKILL.md).

## 1. Before any code

- Fix the domain nouns and roles now (the thing posted, who posts it, who applies). Renaming later touches tables, buckets, routes and every translation.
- Prefer one kind of account that can do everything over role-split accounts.
- Decide what stays free forever and say it publicly; paid features are optional extras.

## 2. Accounts

Open each one when its step needs it, not up front:

| Step | Account |
| --- | --- |
| Start | GitHub; Docker Desktop, Supabase CLI, pnpm, Deno locally |
| Deploy | Supabase (free tier, pick the region near users), Vercel (one project for the app, one for the landing), a domain |
| Auth hardening | Cloudflare Turnstile (hostnames: the app domain and `localhost`) |
| Email | Resend (free: 100/day, shared by confirmations and notifications) |
| Push, analytics | Firebase (web app + Android + iOS apps in one project) |
| Stores | Google Play Console (one-off fee), Apple Developer Program (yearly) |

## 3. Scaffold

```bash
pnpm create @inglorious/app -- my-app --template=js --ui --theme=material-3 --routing --transitions --icons=material --languages=en,it --mobile --app-id=com.example.myapp --pwa --push --skills
```

- `--template=js` or `ts`: whichever the team prefers.
- `--app-id`: the reverse domain the stores know the app by, on a domain you own. It can't change after the first release.
- Choose `--push` and `--mobile` now if the app may need them: they add a migration, an edge function, a service worker, native projects and app wiring, which later means copying from a fresh scaffold. `--analytics` is light enough to decide later.
- With `--auth` or `--push` the project already has `supabase/config.toml`: no `supabase init`.

## 4. Build order

Test first throughout: write the failing test, then the code.

1. **Authorization tests**: an integration test that signs in an owner, a counterpart and a stranger, stating what each may read, write and call.
2. **Schema** that makes them pass: tables, constraints, RLS policies, column grants and security definer functions for anything crossing users, all in one initial migration. Seed test accounts (shared password, documented in the README) and realistic rows.
3. **API layer**: `src/api/` wraps Supabase calls, with integration tests; the client lives in `src/api/client.js`.
4. **Logic**: handler tests with `trigger`, then entities with `handleRequest` (`handleAsync` for what the screen doesn't show), `withLiveReload` + `realtimeSource` for data others change, `fsm` for flows.
5. **UI**: render tests, then screens with Inglorious UI on seed data, following [web-best-practices](../web-best-practices/SKILL.md).
6. **Edge functions**: anything needing the service role or a third-party key.
7. **Notifications and email**: bell table, push via Firebase, Resend emails with unsubscribe links.
8. **Landing and legal**: an SSX site with privacy policy and terms (stores require their URLs).
9. **Hardening**: Turnstile, security headers in `vercel.json`, a ZAP scan against the local stack, daily limits on anything that costs money or reaches others.
10. **Deploy**, then **mobile release**.

Translate as you go: every string is a key from day one.

## 5. Local first

Develop entirely against the dockerized Supabase: it's free, resettable, has Mailpit for emails and runs the integration tests. Touch the cloud only to deploy.

```bash
supabase start
supabase db reset --yes   # migrations + seed
supabase status           # URL and publishable key for .env.local
pnpm dev --host           # phones reach it over the LAN
```

- `.env.local`: `VITE_SUPABASE_URL=http://127.0.0.1:54321`, `VITE_SUPABASE_ANON_KEY=...`, `VITE_TURNSTILE_SITE_KEY=` empty.
- Edge function secrets in `supabase/functions/.env`, never `SUPABASE_*` names (injected).
- Split Vitest into `unit` and `integration` projects; integration tests need the local stack.
- Tests never call paid APIs; edge functions skip them with `isLocalStack`.

## 6. Database rules

- Client code keeps rows snake_case; map a whole object to camelCase or nothing, never single fields.
- Before launch: change the initial migration and `db reset`, locally and `--linked`.
- After launch production is never reset. Big or data-moving changes are new migrations applied with `db push`. Small ones (a constraint) go in the initial migration plus equivalent SQL, tested locally, written to `supabase/snippets/<topic>.sql`, run once in the SQL editor, then deleted.
- Back up before schema work: `supabase db dump --linked --data-only -f backup.sql`, kept out of the repo.
- Installed native builds keep using the old schema: breaking changes ship in two releases (compatible build made mandatory, then the breaking change).

## 7. Deploy

```bash
supabase link --project-ref <ref>
supabase db push
pnpm exec inglorious-supabase secrets   # supabase/functions/.env, then checks each fingerprint
supabase functions deploy   # db push never deploys functions
```

- Dashboard only: Auth Site URL and Redirect URLs, email confirmation, CAPTCHA (turn on only once builds with the site key are live everywhere), rate limits under Resend's quota.
- Vercel: every `VITE_*` variable as a build-time env var; rewrite non-file paths to `index.html`; Ignored Build Step per project so app and landing rebuild only on their own changes.
- A missing function is a 404 that looks like a CORS error (`Failed to fetch`): check `supabase functions list`.

## 8. Releases

create-app sets this up; keep to it.

- `package.json` holds the one version for web, Android and iOS; the app reads it as `import.meta.env.VITE_APP_VERSION`.
- Describe each change with `pnpm changeset`; `pnpm release:version` bumps the version and writes `CHANGELOG.md` (also the stores' "What's New").
- Web and PWA update themselves (the `PwaUpdate` type).
- Native: `pnpm mobile:release` (`inglorious-capacitor version`, then the build) copies the version into both native projects, raises their shared build number and builds with `.env` (not `.env.local`). Commit what it changed, then upload with that build number. With `--ci`, the **Store release** workflow does all of it on GitHub Actions instead (no Mac): it commits the build number, uploads to TestFlight and to Play's internal track.
- Store listing: seed the local backend with demo data, start the app, and run `pnpm mobile:listing-assets` (`listing.config.js`: screens, locales, demo sign-in, prompts answered through `storage`) for every screenshot size, the promo images (feature graphic, header, search results card, from `promo`) in each locale, and Play's 512px icon.
- First review: App Review wants a screen recording from launch on a physical device (sign-up, login, account deletion, reporting and blocking for user content), demo credentials for each account type, the external services and any regional differences in the Notes. Play Console: with Firebase Analytics the advertising ID permission is removed, so declare "No".
- Mandatory native updates (`--mobile --push` generates them): `createNativeUpdate` with `supabaseNativeUpdate` blocks builds below `app_versions.min_build`; raise it only after the build is live in that store, and set `store_url`.

## 9. Docs

Short README (what, features, stack, getting started with seed accounts), then a numbered index of `docs/*.md` guides in reading order, each ending with a "Next:" link: development, styling, edge functions, each feature, mobile, deploying, releasing updates, security. New topics get their own guide.
