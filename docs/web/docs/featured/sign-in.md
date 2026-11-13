---
title: Sign-in
description: "The type behind a sign-in screen: passwords, codes by email, password reset and account erasure"
---

# Sign-in

`@inglorious/web/auth` is the type behind a sign-in screen. It walks from the email to a password, a new account or a code sent by email, holds the signed-in `user`, and erases the account on request, as the App Store and Google Play require of apps that create accounts. Codes rather than links work in a native app too, since nobody has to open anything.

```javascript
import { supabaseAuth } from "@inglorious/supabase"
import { createAuth, watchAuth } from "@inglorious/web/auth"

const adapter = supabaseAuth(supabase)

const types = {
  Auth: { ...createAuth({ adapter, methods: ["password", "code"] }), render },
}

watchAuth(adapter, store) // keeps `user` in step with the session
```

`methods` lists what the screen offers: `"password"` (sign in, create an account confirmed with a code, reset a forgotten password with a code) and `"code"` (sign in with a code alone, creating the account on first use).

The entity's `step` says what to ask for: `"email"`, `"password"`, `"signUp"`, `"code"` or `"reset"`. Its events take what the person typed: `emailSubmit(email)`, `signInSubmit(password)`, `signUpSubmit({ password, data })`, `codeSubmit(code)`, `resetSubmit({ code, password })`, and move between steps: `signUpShow`, `signInShow`, `codeRequest`, `codeResend`, `resetRequest`, `back`. Signed in, `signOut` and `accountEraseAsk`, then `accountErase` or `accountEraseCancel`. `isReady` turns true once the saved session is read: until then, render nothing rather than the sign-in screen.

Whoever signs in, by password, code, link or password reset, the entity gets `signedIn` with `{ user, isNew }`, `isNew` for an account just created. Add a handler to move on:

```javascript
const types = {
  Auth: [
    createAuth({ adapter }),
    {
      signedIn(entity, { isNew }, api) {
        api.notify("#router:navigate", isNew ? "/onboarding" : "/")
      },
    },
  ],
}
```

For a page that a confirmation email's link opens, `linkSubmit({ tokenHash })` signs in with the link instead of the code. Ask for a tap first: mail scanners open links too.

`status` is `"loading"` while waiting, and `error` is a key to put into words: `"invalidEmail"`, `"invalidCode"`, `"weakPassword"`, `"invalidCredentials"`, `"accountExists"`, `"rateLimited"`, `"captcha"`, `"network"` or `"unknown"`. An account not confirmed yet goes straight to the code.

The adapter talks to the backend. `supabaseAuth` from `@inglorious/supabase` is one; another backend needs `onSessionChange`, `signIn`, `signUp`, `sendCode`, `verifyCode`, `verifyLink`, `resendCode`, `sendResetCode`, `updatePassword`, `signOut`, `eraseAccount` and `errorCode`, plus `accountExists` to skip straight to the password or the new account, and `prepare(action)`, called once the next step is known (`"signIn"` or `"signUp"`), such as to solve a CAPTCHA before the person submits.

`create-app --auth` generates the screen, the account actions in the app bar, the Edge Function that erases accounts and the email templates.
