---
title: Releasing to the Stores
description: Version, build number, build and upload
---

# Releasing to the Stores

The version users see comes from `package.json`, the same on the web, Android and iOS. The build number is shared by both native apps and must go up with every store upload.

1. Describe each change as you make it with `pnpm changeset`. When a release is due, `pnpm release:version` raises the version and writes `CHANGELOG.md`. Skip this to upload another build of the same version, for example to TestFlight.
2. Run `pnpm mobile:release`. It copies the version into both native projects, raises the build number, builds with the production values in `.env` (ignoring `.env.local`), and syncs. Commit what it changed.
3. Upload:
   - **Xcode**: **Product → Archive**, then **Distribute App → Custom → App Store Connect → Upload**, and untick **Manage Version and Build Number** so the store gets the project's build number.
   - **Android Studio**: **Build → Generate Signed App Bundle**, then upload it in Play Console.

Or skip steps 2 and 3 with [Cloud Builds](./ci.md), which do them on GitHub Actions.

The App Store takes versions of up to three numbers, so keep the version `MAJOR.MINOR.PATCH`, with no pre-release tag.

Before the first release, check the [Store Requirements](./store-requirements.md) and make the [listing images](./listing-assets.md). Once a build is live, consider making it [mandatory](./updates.md#mandatory-native-updates).
