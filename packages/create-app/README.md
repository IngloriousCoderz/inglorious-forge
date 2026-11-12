# @inglorious/create-app

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The official scaffolding tool to quickly create a new web app with the [@inglorious/web](https://www.npmjs.com/package/@inglorious/web) framework or a pre-rendered site, static or server-rendered, with [@inglorious/ssx](https://www.npmjs.com/package/@inglorious/ssx).

This package allows you to generate a new project from a set of pre-configured templates, so you can start developing your web app right away.

## Usage

To create a new app, run this command in your terminal. You will be prompted to choose a project name and select a template.

```bash
pnpm create @inglorious/app
```

The CLI will guide you through the setup process, asking for a project name and which template you'd like to use.

For the JavaScript and TypeScript Vite templates, the CLI then asks about the app's features:

| Question                  | Flag                                                                     | Adds                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Use Inglorious UI?        | `--ui` / `--no-ui`                                                       | `@inglorious/ui`, its base styles, an app bar, toasts (`api.notify("#toast:show", { message })`) and `watchKeyboard`    |
| Which theme?              | `--theme=inglorious\|material-ui\|material-3\|bootstrap\|ios-18\|ios-26` | The theme's stylesheet and class                                                                                        |
| Is it a mobile app?       | `--mobile` / `--no-mobile`                                               | Capacitor for Android and iOS; with Inglorious UI, a bottom tab bar and safe-area spacing                               |
| Add routing?              | `--routing` / `--no-routing`                                             | The Router, a home and an about page, and navigation between them                                                       |
| Animate page transitions? | `--transitions` / `--no-transitions`                                     | View transitions between pages (with routing and Inglorious UI)                                                         |
| Which icon packs?         | `--icons=material,fontawesome,lucide` / `--no-icons`                     | Iconify icon sets, drawn by Inglorious UI's `Icon` (with Inglorious UI)                                                 |
| Translate the app?        | `--i18n` / `--no-i18n`, `--languages=en,it`                              | `@inglorious/i18n`, a catalogue per language and a language picker; the first language is the default                   |
| Add analytics?            | `--analytics` / `--no-analytics`                                         | Google Analytics for Firebase behind a consent prompt, on the web and in the native apps                                |
| Add sign-in?              | `--auth` / `--no-auth`, `--auth-methods=password,code`                   | Supabase Auth: a sign-in screen with a password, a code by email or both, password reset, sign-out and account deletion |
| Add push notifications?   | `--push` / `--no-push`                                                   | Firebase Cloud Messaging, a permission prompt and the Supabase side of sending; turns on PWA support                    |
| Enable PWA support?       | `--pwa` / `--no-pwa`                                                     | `vite-plugin-pwa`, a manifest, icons, and a service worker that keeps installed apps on the latest version              |

Every template has a `vercel.json` that deploys only the `main` branch on Vercel; change `main` there if your production branch has another name. Every template except `minimal` also gets `.github/dependabot.yml`, which opens weekly dependency updates on GitHub grouped into two pull requests: one for `@inglorious/*`, one for everything else.

Every template except `minimal` then asks whether to add agent skills (`--skills` / `--no-skills`). Saying yes runs the [skills CLI](https://skills.sh) in the new project. It asks which coding agents to install for, and installs the [Inglorious Forge skills](https://github.com/IngloriousCoderz/forge-skills) that match your choices: `forge`, `forge-best-practices`, `app-recipe`, `store`, `web` and `web-best-practices` always, plus `ssx`, `vite-plugin-jsx` or `vite-plugin-vue`, `ui` and `ui-best-practices`, `i18n`, `firebase` and `supabase` when the project uses them. If the install fails, the CLI prints the command to retry it.

The app is generated in the syntax you chose: lit-html, JSX or Vue. Every question answered on the command line is skipped, so a project can be created without any prompt:

| Question                    | Argument or flag                             |
| --------------------------- | -------------------------------------------- |
| What is your project named? | The first argument, such as `my-app`         |
| Select a template           | `--template=minimal\|js\|ts\|ssx-js\|ssx-ts` |
| Select a rendering syntax   | `--syntax=lit-html\|jsx\|vue`                |

```bash
pnpm create @inglorious/app my-app --template=ts --syntax=jsx --ui --theme=material-3 --routing --transitions --icons=material --languages=en,it --no-mobile --no-analytics --no-push --no-pwa --skills
```

Analytics and push generate their setup steps into the new project's README, and a `.env.example`. Push also generates a Supabase migration, the `push-notify` edge function and a service worker: a push is sent by inserting a row in `notifications`. It needs a Firebase project, a Supabase project and a sign-in screen, since the permission prompt appears once someone is signed in with Supabase Auth: `--auth` generates one.

Sign-in (`--auth`) shows a sign-in screen instead of the app until someone signs in, with `createAuth` from `@inglorious/web/auth` and `supabaseAuth` from `@inglorious/supabase`. `--auth-methods` picks how: `password` (with password reset, and a code to confirm a new account), `code` (a code sent by email, no password) or both. Codes rather than links work in the native app too. With routing, a **Profile** page (a link, or a tab on mobile) shows who is signed in, with **Sign out** and **Delete account**; without routing, the app bar has both. Deleting the account, which the App Store and Google Play require of apps that create accounts, goes through the generated `erase-account` Edge Function. The project also gets the email templates with the codes, and the README explains the Supabase setup and, for mobile apps, the privacy declarations the stores ask for.

## Templates

The following templates are available to get you started:

- **minimal**: A minimal starter template that requires no bundling: just HTML, CSS, and JS.
- **js**: A starter template for a plain JavaScript project, bundled with Vite.
- **ts**: A starter template for a plain TypeScript project, bundled with Vite.
- **ssx-js**: A starter template for a Static Site Xecution (SSX) project using JavaScript.
- **ssx-ts**: A starter template for a Static Site Xecution (SSX) project using TypeScript.

## What it does

The tool will create a new directory with your chosen project name and copy the template files into it. It will also automatically update the `package.json` with your project's name.

After the project is created, you can navigate into the directory and install the dependencies.

```bash
# 1. Change into your new project directory
cd my-awesome-app

# 2. Install dependencies
pnpm install

# 3. Start the development server
pnpm dev
```

When mobile support is enabled, `android/` and `ios/` are set up from `native` in `package.json` by [`@inglorious/capacitor`](../capacitor), after every `cap sync`: App Links and Universal Links (with both `.well-known` files, which `vercel.json` serves as JSON), your Apple Team ID, iOS swipe back (with routing), push, Analytics consent, permissions and Info.plist entries, and the Firebase files from the project's root. Nothing needs setting in Xcode or Android Studio. Each native project starts with the app's logo as its icon and splash screen; `pnpm mobile:assets` makes them again after a new logo. The status bar follows the app's theme through `watchSystemBars` from `@inglorious/web/system-bars`, so it stays readable when the phone is in dark mode. `haptics` from `@inglorious/web/haptics` plays the system's haptics through `@capacitor/haptics`.

Initialize the native platforms once, then build and sync them with:

```bash
# Run one or both commands once, depending on the platforms you need
pnpm mobile:init:android
pnpm mobile:init:ios

pnpm mobile:sync

# Build and open the native app
pnpm mobile:android
# or
pnpm mobile:ios
```

For Android and iOS builds, install Android Studio with the Android SDK and a Java runtime compatible with Capacitor. Capacitor currently works reliably with JDK 21, so prefer JDK 21 over newer Java versions if you hit Java compatibility issues. Set `JAVA_HOME` to your JDK 21 install and `ANDROID_HOME` to your Android SDK path before running the native app. See the official Capacitor setup guides for platform-specific instructions:

- Android: https://capacitorjs.com/docs/android
- iOS: https://capacitorjs.com/docs/ios
- Android Studio: https://developer.android.com/studio

### Versions and releases

Every Vite app is versioned with [Changesets](https://github.com/changesets/changesets): describe each change with `pnpm changeset`, and `pnpm release:version` raises the version in `package.json` and writes `CHANGELOG.md`. The app reads that version as `import.meta.env.VITE_APP_VERSION`.

Mobile apps also get `pnpm mobile:release`, which copies the version into the iOS and Android projects, raises the build number they share (every store upload needs a new one), builds with the values in `.env` rather than `.env.local`, and syncs. The generated README describes the whole release, upload included. With `--push` too, an `app_versions` table in Supabase holds each platform's minimum build: an older install shows nothing but an update page, so raising it makes a release mandatory. Those apps also update their web code without the stores: `pnpm live:release` signs the committed code and publishes it to a Supabase Storage bucket, and the installed apps switch to it the next time they go to the background. Only native changes still need a store release. `pnpm live:keys` makes the signing keys once, and the generated README explains the rest. Mobile apps also open links to their domain in the app: with routing, `watchAppLinks` from `@inglorious/web/app-links` sends the router to the link's path. With routing, Android's back button and back gesture close the app from a top-level page, through `watchBackButton` from `@inglorious/web/back-button`, and the tab bar replaces the current page instead of piling up history.

## License

**MIT License - Free and open source**

Created by [Matteo Antony Mistretta](https://github.com/IngloriousCoderz)

You're free to use, modify, and distribute this software. See [LICENSE](./LICENSE) for details.
