---
title: Comparison
description: How Create App compares with Expo, Ionic, React Native and Flutter
---

# Comparison

Create App competes with the tools people reach for when one codebase has to become a website and two store apps. Here is where it stands, honestly.

## At a glance

|                             | Create App                                        | Expo (React Native)                    | Ionic (Capacitor)                         | Flutter                             |
| --------------------------- | ------------------------------------------------- | -------------------------------------- | ----------------------------------------- | ----------------------------------- |
| UI                          | Web, themed like iOS or Material                  | Native widgets                         | Web, Ionic components                     | Own renderer                        |
| Same code on the web        | Yes, it is a web app                              | Partly, through React Native Web       | Yes                                       | Yes, as a canvas app                |
| Native project setup        | `native` in `package.json`, applied on every sync | Config plugins                         | By hand in Xcode and Android Studio       | By hand in Xcode and Android Studio |
| Icons and splash screens    | From one logo, light and dark                     | From one image                         | `@capacitor/assets`, set up by hand       | Community packages                  |
| Run on a phone while coding | Live reload of your installed app                 | Expo Go: scan a QR code, no install    | Live reload                               | Hot reload                          |
| Cloud builds                | GitHub Actions workflow, your own minutes         | EAS Build, hosted                      | Hosted services, such as Capawesome Cloud | Codemagic and others                |
| Updates without the stores  | Signed live updates on Supabase                   | EAS Update                             | Hosted services, such as Capawesome Cloud | Shorebird                           |
| Mandatory updates           | Generated                                         | By hand                                | By hand                                   | By hand                             |
| Sign-in screen              | Generated, with account deletion                  | By hand                                | By hand                                   | By hand                             |
| Push                        | Generated, web and native, with sending           | `expo-notifications`, sending is yours | Plugin, the rest is yours                 | Plugin, the rest is yours           |
| Store listing screenshots   | Generated from the running app                    | By hand                                | By hand                                   | By hand                             |
| State and native features   | Entities and events, native features as entities  | React state, plugins                   | Your framework, raw plugins               | Widgets, plugins                    |

## Choose Create App when

- The app should also be a real website or PWA, sharing every line.
- You want sign-in, push, updates and store releases working on day one rather than assembled from tutorials.
- You like plain data and events more than components holding state, and want a coding agent to follow the same conventions.
- Supabase and Firebase suit you, or you are willing to write [an adapter](../backend/bring-your-own.md).

## Choose something else when

- **The UI must be native widgets**, with platform scrolling physics and 120 Hz animations everywhere: React Native or Flutter.
- **You need a dev client without installing anything**: Expo Go's QR code has no equivalent here.
- **You want hosted builds and updates with a dashboard** and don't mind paying for them: EAS, or a hosted service for Capacitor.
- **Heavy native code** (custom camera pipelines, games on Metal or Vulkan, background processing): native, Flutter or React Native modules.
- **Native Google and Apple sign-in or passkeys** today: they aren't generated yet.
