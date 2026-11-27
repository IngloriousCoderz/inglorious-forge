# @inglorious/create-app

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

One command to a web app, a PWA and native Android and iOS apps on [Inglorious Web](https://inglorious.dev/web/), or a pre-rendered site with [SSX](https://inglorious.dev/ssx/), with sign-in, push, live updates and store releases already wired.

**[Documentation](https://inglorious.dev/create-app/)**

## Try it online

The `js` and `ts` templates run on StackBlitz, with nothing to install: open the [JavaScript](https://stackblitz.com/github/IngloriousCoderz/inglorious-forge/tree/main/stackblitz/app?file=src/app/message/index.js) or the [TypeScript](https://stackblitz.com/github/IngloriousCoderz/inglorious-forge/tree/main/stackblitz/app-ts?file=src/app/message/index.ts) one.

## Usage

```bash
pnpm create @inglorious/app
```

The CLI asks for a project name, a template, a syntax (lit-html, JSX or Vue) and, for the `js` and `ts` templates, the app's features. Every question has a flag, so a project can be created without any prompt:

```bash
pnpm create @inglorious/app my-app --template=ts --syntax=lit-html --ui --theme=ios-26 --mobile --app-id=com.example.myapp --ci --routing --transitions --icons=material --no-i18n --no-analytics --auth --auth-methods=password,code --push --skills
```

| Question                  | Flag                                                                     | Adds                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Template                  | `--template=minimal\|js\|ts\|ssx-js\|ssx-ts`                             | No build, Vite with JavaScript or TypeScript, or a pre-rendered SSX site                                        |
| Syntax                    | `--syntax=lit-html\|jsx\|vue`                                            | The template language of the generated code                                                                     |
| Use Inglorious UI?        | `--ui`                                                                   | `@inglorious/ui`, an app bar, toasts and `watchKeyboard`                                                        |
| Which theme?              | `--theme=inglorious\|material-ui\|material-3\|bootstrap\|ios-18\|ios-26` | The theme, light and dark                                                                                       |
| Is it a mobile app?       | `--mobile`                                                               | Capacitor, native settings from `package.json`, live reload on a device, icons, listing images, release scripts |
| What is the app id?       | `--app-id=com.example.myapp`                                             | The reverse-domain id the stores know the app by (with `--mobile`)                                              |
| Cloud builds?             | `--ci`                                                                   | A GitHub Actions workflow that uploads to TestFlight and Google Play's internal track                           |
| Add routing?              | `--routing`                                                              | The router, pages, App Links, back button and swipe back                                                        |
| Animate page transitions? | `--transitions`                                                          | View transitions between pages                                                                                  |
| Which icon packs?         | `--icons=material,fontawesome,lucide`                                    | Iconify icon sets                                                                                               |
| Translate the app?        | `--i18n`, `--languages=en,it`                                            | `@inglorious/i18n` and a language picker                                                                        |
| Add analytics?            | `--analytics`                                                            | Google Analytics for Firebase behind a consent prompt                                                           |
| Add sign-in?              | `--auth`, `--auth-methods=password,code`                                 | Supabase Auth, password reset and account deletion                                                              |
| Add push notifications?   | `--push`                                                                 | Firebase Cloud Messaging and Supabase sending; with `--mobile`, live and mandatory native updates               |
| Enable PWA support?       | `--pwa`                                                                  | An installable app that keeps itself up to date                                                                 |
| Add agent skills?         | `--skills`                                                               | The Inglorious Forge skills for coding agents                                                                   |

Each boolean flag has a `--no-` form. `--app-name="My App"` sets the name people see (app bar, page title, PWA manifest, under the icon); without it, the project name in words: `my-app` is `My App`. Every `js` and `ts` project gets Vitest and a first test (`pnpm test`). Sign-in, analytics, push and updates use Supabase and Firebase, each through an adapter you can replace: see [Services It Uses](https://inglorious.dev/create-app/backend/services) and [Bring Your Own Backend](https://inglorious.dev/create-app/backend/bring-your-own).

Then:

```bash
cd my-app
pnpm install
pnpm dev
```

The generated README holds the setup steps for exactly the features you chose.

## License

**MIT License - Free and open source**

Created by [Matteo Antony Mistretta](https://github.com/IngloriousCoderz)

You're free to use, modify, and distribute this software. See [LICENSE](./LICENSE) for details.
