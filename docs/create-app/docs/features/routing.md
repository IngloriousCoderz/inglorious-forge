---
title: Routing and Transitions
description: Pages, navigation and animated page transitions
---

# Routing and Transitions

| Question                  | Flag                                 |
| ------------------------- | ------------------------------------ |
| Add routing?              | `--routing` / `--no-routing`         |
| Animate page transitions? | `--transitions` / `--no-transitions` |

`--routing` adds the [Router](https://inglorious.dev/web/featured/router), a home and an about page under `src/views/`, routes in `src/store/routes`, and navigation between them. With [sign-in](./auth.md), a profile page joins them.

A new page is a folder under `src/views/` with its type, a route, and a link or tab in `src/app`.

`--transitions` animates the change of page with view transitions, through `withTransitions` from Inglorious UI. It needs routing and `--ui`.

## In the native apps

Routing also turns on the native behaviours that depend on pages:

- **App Links**: a link to the app's domain opens the app on that page. See [Opening Links in the App](../mobile/app-links.md).
- **Android back button**: back from a top-level page closes the app, as other Android apps do, and the tab bar replaces the current page instead of piling up history.
- **iOS swipe back**: a swipe from the left edge goes back.
