---
title: Cloud Builds
description: Build and upload both apps on GitHub Actions, without a Mac
---

# Cloud Builds

| Question                                           | Flag               |
| -------------------------------------------------- | ------------------ |
| Build and upload store releases on GitHub Actions? | `--ci` / `--no-ci` |

`--ci` adds `.github/workflows/store-release.yml`. It runs by itself when a push to `main` raises the version in `package.json`, so releasing is `pnpm release:version`, a commit and a push. To upload another build of the same version, run **Store release** from the repository's **Actions** tab, choosing both stores or one. It:

1. Raises the build number and commits it to the branch.
2. Builds the iOS app on a macOS runner, signs it with certificates Apple manages in the cloud, and uploads it to TestFlight.
3. Builds the Android app bundle, signs it with your upload key, and uploads it to Google Play's internal testing track.

Pushes that change `package.json` without raising the version, such as dependency updates, don't start a release.

## Secrets

Add these under **Settings → Secrets and variables → Actions**:

| Secret                        | Value                                                                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `ENV_FILE`                    | The contents of `.env`: the production values the app is built with                                                                   |
| `APP_STORE_CONNECT_KEY`       | The `.p8` file of an App Store Connect API key with the **Admin** role (**Users and Access → Integrations**)                          |
| `APP_STORE_CONNECT_KEY_ID`    | That key's ID                                                                                                                         |
| `APP_STORE_CONNECT_ISSUER_ID` | The Issuer ID above the list of keys                                                                                                  |
| `ANDROID_KEYSTORE_BASE64`     | Your upload keystore, as `base64 -i upload.jks` prints it                                                                             |
| `ANDROID_KEYSTORE_PASSWORD`   | Its password                                                                                                                          |
| `ANDROID_KEY_ALIAS`           | The key's alias in it                                                                                                                 |
| `ANDROID_KEY_PASSWORD`        | The key's password                                                                                                                    |
| `PLAY_SERVICE_ACCOUNT_JSON`   | The JSON key of a Google Cloud service account invited in Play Console (**Users and permissions**) that can release to testing tracks |

The Admin role lets `xcodebuild` create the distribution certificate and profile it signs with, so there is nothing to export from a Mac.

## Before the first run

- `native.ios.teamId` is set, and `android/` and `ios/` are committed. Creating them (`pnpm mobile:init:ios`) is the one step that wants a Mac; a colleague's, once, is enough.
- The app exists in App Store Connect and in Play Console.
- Google Play takes the first app bundle only by hand: upload one from Play Console before the workflow's first run.
- If the branch is protected, let `github-actions[bot]` push to it, so the workflow can commit the build number.

The workflow runs on your GitHub Actions minutes; macOS minutes count more than Linux ones on private repositories. Edit the file freely: it is yours, and nothing regenerates it.
