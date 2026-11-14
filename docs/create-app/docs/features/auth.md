---
title: Sign-in
description: A sign-in screen on Supabase Auth, with account deletion
---

# Sign-in

| Question               | Flag                                         |
| ---------------------- | -------------------------------------------- |
| Add sign-in?           | `--auth` / `--no-auth`                       |
| How do people sign in? | `--auth-methods=password,code` (one or both) |

`--auth` shows a sign-in screen instead of the app until someone signs in. It is built on [`createAuth`](https://inglorious.dev/web/featured/sign-in) from `@inglorious/web/auth` and `supabaseAuth` from [`@inglorious/supabase`](https://www.npmjs.com/package/@inglorious/supabase):

- `password`: sign in with a password, create an account confirmed with a code, and reset a forgotten password with a code.
- `code`: sign in with a code sent by email, no password; the first code creates the account.

The screen asks for the email first, then for what comes next. Codes rather than links work in the native app too, since nobody has to open anything.

With routing, a **Profile** page (a link, or a tab on mobile) shows who is signed in, with **Sign out** and **Delete account**; without routing, the app bar has both.

## Setup

With the [Supabase CLI](https://supabase.com/docs/guides/cli):

1. `supabase init` in the project, and add the generated email templates (`supabase/templates/`) to `supabase/config.toml`. The generated README has the exact lines.
2. `supabase start` runs it locally: the emails arrive in Mailpit, which `supabase status` lists.
3. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `supabase status`.

For the hosted project, paste the three templates under **Authentication → Emails**, then deploy the function that erases accounts:

```bash
supabase link --project-ref <your project ref>
supabase functions deploy erase-account
```

To stop bots from creating accounts, turn on CAPTCHA protection with Cloudflare Turnstile under **Authentication → Attack Protection**, and set `VITE_TURNSTILE_SITE_KEY`.

## Deleting an account

Apple and Google require apps that create accounts to delete them from inside the app. **Delete account** calls the generated `erase-account` Edge Function, which deletes the user with `eraseUser` from `@inglorious/supabase/edge`. Tables whose rows belong to a user should reference `auth.users` with `on delete cascade`; files under a folder named after the user's id go too, in the buckets listed in `USER_BUCKETS`.

## Moving on after sign-in

The `auth` entity receives `signedIn` with `{ user, isNew }` after every sign-in, whichever way it happened. Handle it to send new accounts to an onboarding page:

```js
const Auth = [
  createAuth({ adapter, methods: ["password", "code"] }),
  {
    signedIn(entity, { isNew }, api) {
      if (isNew) api.notify("#router:navigate", "/onboarding")
    },
  },
]
```

If sign-up asks for more than an email, such as a name or accepted terms, pass `codeCreatesAccount: false` to `supabaseAuth`, so a sign-in code only signs in existing accounts.

## Not generated yet

Google and Apple sign-in and passkeys are not part of the screen yet. Supabase supports OAuth providers, and the screen's adapter can grow to call them.
