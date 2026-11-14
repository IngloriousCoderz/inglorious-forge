---
title: Store Requirements
description: What Apple and Google ask for, and what is already handled
---

# Store Requirements

The stores reject apps for a handful of recurring reasons. Here is what a generated app already covers, and what is left to you.

| Requirement                                           | Store       | Handled by                                                                                |
| ----------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| In-app account deletion for apps that create accounts | Both        | `--auth`: **Delete account** and the `erase-account` Edge Function                        |
| A web address to request account deletion             | Google Play | Yours: give it in the Data safety form                                                    |
| Privacy manifest (`PrivacyInfo.xcprivacy`)            | App Store   | `configure`: plugins' required-reason APIs, plus `native.ios.privacyManifest`             |
| Export compliance                                     | App Store   | `ITSAppUsesNonExemptEncryption: false` in `native.ios.infoPlist`                          |
| Usage descriptions for camera, microphone…            | App Store   | Yours: add them to `native.ios.infoPlist`                                                 |
| No advertising ID without ads                         | Google Play | `configure` removes the `AD_ID` permission Firebase adds: answer "No"                     |
| Analytics only after consent                          | Both        | `--analytics`: collection off until the person agrees                                     |
| App Privacy answers                                   | App Store   | Yours: the email (for the account) and anything else the app collects, linked to the user |
| Data safety form                                      | Google Play | Yours: the same answers as App Privacy                                                    |
| Screenshots and promotional images                    | Both        | [`pnpm mobile:listing-assets`](./listing-assets.md)                                       |
| A demo account for the reviewers                      | Both        | Yours: give its email and password in the review notes                                    |
| Sign in with Apple when offering Google sign-in       | App Store   | Not needed: the generated sign-in uses email only                                         |
