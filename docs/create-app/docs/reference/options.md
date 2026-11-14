---
title: Options
description: Every question create-app asks, and its flag
---

# Options

Every question answered by a flag is skipped. Each boolean flag has a `--no-` form.

## Project

| Question                    | Argument or flag                             | Default    |
| --------------------------- | -------------------------------------------- | ---------- |
| What is your project named? | The first argument, such as `my-app`         | `my-app`   |
| Select a template           | `--template=minimal\|js\|ts\|ssx-js\|ssx-ts` |            |
| Select a rendering syntax   | `--syntax=lit-html\|jsx\|vue`                | `lit-html` |

## App features

For the `js` and `ts` templates only.

| Question                                           | Flag                                                                     | Adds                                                                                                                      | Default        |
| -------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Use Inglorious UI?                                 | `--ui`                                                                   | [Inglorious UI](../features/ui.md), an app bar, toasts, `watchKeyboard`                                                   | yes            |
| Which theme?                                       | `--theme=inglorious\|material-ui\|material-3\|bootstrap\|ios-18\|ios-26` | The theme's stylesheet and class                                                                                          | `inglorious`   |
| Is it a mobile app?                                | `--mobile`                                                               | [Capacitor](../mobile/overview.md), a tab bar and safe areas                                                              | no             |
| Build and upload store releases on GitHub Actions? | `--ci`                                                                   | [A store release workflow](../mobile/ci.md) (with `--mobile`)                                                             | no             |
| Add routing?                                       | `--routing`                                                              | [The router](../features/routing.md), a home and an about page                                                            | yes            |
| Animate page transitions?                          | `--transitions`                                                          | View transitions between pages (with routing and UI)                                                                      | yes            |
| Which icon packs?                                  | `--icons=material,fontawesome,lucide`                                    | [Iconify sets](../features/ui.md#icons) (with UI)                                                                         | `material`     |
| Translate the app into several languages?          | `--i18n`, `--languages=en,it,fr,de,es,pt,ja,ar`                          | [Translations](../features/i18n.md); the first language is the default                                                    | no             |
| Add analytics with a consent prompt?               | `--analytics`                                                            | [Google Analytics for Firebase](../features/analytics.md)                                                                 | no             |
| Add sign-in?                                       | `--auth`, `--auth-methods=password,code`                                 | [Supabase Auth](../features/auth.md), account deletion                                                                    | no, `password` |
| Add push notifications?                            | `--push`                                                                 | [Push](../features/push.md) through Firebase and Supabase; turns on PWA; with `--mobile`, [updates](../mobile/updates.md) | no             |
| Enable PWA support?                                | `--pwa`                                                                  | [An installable app](../features/pwa.md) that keeps itself up to date                                                     | no             |

## Agent skills

For every template but `minimal`.

| Question                            | Flag       | Default |
| ----------------------------------- | ---------- | ------- |
| Add agent skills for coding agents? | `--skills` | yes     |

See [Agent Skills](../features/skills.md).
