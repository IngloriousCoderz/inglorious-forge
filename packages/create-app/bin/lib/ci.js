import fs from "fs"
import { EOL } from "os"
import path from "path"

const WORKFLOW = `name: Store release

on:
  workflow_dispatch:
    inputs:
      platforms:
        description: Which stores
        type: choice
        options: [both, ios, android]
        default: both

concurrency: store-release

jobs:
  version:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    outputs:
      sha: \${{ steps.commit.outputs.sha }}
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version-file: package.json
      - name: Raise the build number
        run: node scripts/native-version.mjs | tee "$RUNNER_TEMP/build.txt"
      - id: commit
        name: Commit it
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git commit -am "$(cat "$RUNNER_TEMP/build.txt") [skip ci]"
          git push
          echo "sha=$(git rev-parse HEAD)" >> "$GITHUB_OUTPUT"

  ios:
    needs: version
    if: inputs.platforms != 'android'
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v5
        with:
          ref: \${{ needs.version.outputs.sha }}
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v5
        with:
          node-version-file: package.json
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: Build the web app
        env:
          ENV_FILE: \${{ secrets.ENV_FILE }}
        run: |
          printf '%s\\n' "$ENV_FILE" > .env
          pnpm build:release
          pnpm cap sync ios
      - name: Archive and upload to TestFlight
        env:
          ASC_KEY: \${{ secrets.APP_STORE_CONNECT_KEY }}
          ASC_KEY_ID: \${{ secrets.APP_STORE_CONNECT_KEY_ID }}
          ASC_ISSUER_ID: \${{ secrets.APP_STORE_CONNECT_ISSUER_ID }}
        run: |
          KEY="$RUNNER_TEMP/AuthKey.p8"
          printf '%s\\n' "$ASC_KEY" > "$KEY"
          TEAM_ID=$(node -p "require('./package.json').native.ios.teamId")
          cat > "$RUNNER_TEMP/ExportOptions.plist" <<PLIST
          <?xml version="1.0" encoding="UTF-8"?>
          <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
          <plist version="1.0">
          <dict>
            <key>method</key><string>app-store-connect</string>
            <key>destination</key><string>upload</string>
            <key>teamID</key><string>$TEAM_ID</string>
            <key>signingStyle</key><string>automatic</string>
            <key>manageAppVersionAndBuildNumber</key><false/>
          </dict>
          </plist>
          PLIST
          AUTH=(-allowProvisioningUpdates -authenticationKeyPath "$KEY" -authenticationKeyID "$ASC_KEY_ID" -authenticationKeyIssuerID "$ASC_ISSUER_ID")
          xcodebuild archive -project ios/App/App.xcodeproj -scheme App -configuration Release \\
            -destination generic/platform=iOS -archivePath "$RUNNER_TEMP/App.xcarchive" "\${AUTH[@]}"
          xcodebuild -exportArchive -archivePath "$RUNNER_TEMP/App.xcarchive" \\
            -exportOptionsPlist "$RUNNER_TEMP/ExportOptions.plist" -exportPath "$RUNNER_TEMP/export" "\${AUTH[@]}"

  android:
    needs: version
    if: inputs.platforms != 'ios'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with:
          ref: \${{ needs.version.outputs.sha }}
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v5
        with:
          node-version-file: package.json
          cache: pnpm
      - uses: actions/setup-java@v5
        with:
          distribution: temurin
          java-version: 21
      - run: pnpm install --frozen-lockfile
      - name: Build the web app
        env:
          ENV_FILE: \${{ secrets.ENV_FILE }}
        run: |
          printf '%s\\n' "$ENV_FILE" > .env
          pnpm build:release
          pnpm cap sync android
          echo "APP_ID=$(pnpm --silent exec cap config --json | node -p "JSON.parse(require('fs').readFileSync(0)).app.appId")" >> "$GITHUB_ENV"
      - name: Build the signed app bundle
        env:
          KEYSTORE: \${{ secrets.ANDROID_KEYSTORE_BASE64 }}
          KEYSTORE_PASSWORD: \${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          KEY_ALIAS: \${{ secrets.ANDROID_KEY_ALIAS }}
          KEY_PASSWORD: \${{ secrets.ANDROID_KEY_PASSWORD }}
        run: |
          printf '%s' "$KEYSTORE" | base64 --decode > "$RUNNER_TEMP/upload.jks"
          cd android
          ./gradlew bundleRelease \\
            -Pandroid.injected.signing.store.file="$RUNNER_TEMP/upload.jks" \\
            -Pandroid.injected.signing.store.password="$KEYSTORE_PASSWORD" \\
            -Pandroid.injected.signing.key.alias="$KEY_ALIAS" \\
            -Pandroid.injected.signing.key.password="$KEY_PASSWORD"
      - name: Upload to the internal testing track
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: \${{ secrets.PLAY_SERVICE_ACCOUNT_JSON }}
          packageName: \${{ env.APP_ID }}
          releaseFiles: android/app/build/outputs/bundle/release/app-release.aab
          track: internal
          status: completed
`

const README_SECTION = `### Releasing from GitHub Actions

\`.github/workflows/store-release.yml\` builds and uploads both apps without a Mac or Android Studio: run **Store release** from the repository's **Actions** tab. It raises the build number and commits it, then builds the iOS app on a macOS runner and uploads it to TestFlight, and builds the Android app bundle and uploads it to Google Play's internal testing track. Raise the version first, as above, if the release is a new one.

It needs \`native.ios.teamId\`, \`android/\` and \`ios/\` committed, and these repository secrets (**Settings → Secrets and variables → Actions**):

| Secret                                | Value                                                                                                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \`ENV_FILE\`                            | The contents of \`.env\`, the production values the app is built with                                                                                                    |
| \`APP_STORE_CONNECT_KEY\`               | The \`.p8\` file of an App Store Connect API key with the **Admin** role (**Users and Access → Integrations**), which signs the app with certificates Apple manages in the cloud |
| \`APP_STORE_CONNECT_KEY_ID\`            | That key's ID                                                                                                                                                           |
| \`APP_STORE_CONNECT_ISSUER_ID\`         | The Issuer ID above the list of keys                                                                                                                                    |
| \`ANDROID_KEYSTORE_BASE64\`             | Your upload keystore, as \`base64 -i upload.jks\` prints it                                                                                                               |
| \`ANDROID_KEYSTORE_PASSWORD\`           | Its password                                                                                                                                                            |
| \`ANDROID_KEY_ALIAS\`                   | The key's alias in it                                                                                                                                                   |
| \`ANDROID_KEY_PASSWORD\`                | The key's password                                                                                                                                                      |
| \`PLAY_SERVICE_ACCOUNT_JSON\`           | The JSON key of a Google Cloud service account invited in Play Console (**Users and permissions**) with the right to release to testing tracks                          |

The app must already exist in App Store Connect and in Play Console, and Google Play takes the first app bundle only by hand: upload one from Play Console before the workflow's first run. If the default branch is protected, let \`github-actions[bot]\` push to it, so the workflow can commit the build number.`

/**
 * Builds and uploads the native apps on GitHub Actions: a manual workflow
 * that raises the build number, then uploads to TestFlight and to Google
 * Play's internal track. Call after `addMobileSupport`, whose README section
 * this one follows.
 *
 * @param {string} targetDir
 */
export function addCiSupport(targetDir) {
  const dir = path.join(targetDir, ".github", "workflows")
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, "store-release.yml"), WORKFLOW)

  const readmePath = path.join(targetDir, "README.md")
  if (!fs.existsSync(readmePath)) return
  const readme = fs.readFileSync(readmePath, "utf-8")
  if (readme.includes("### Releasing from GitHub Actions")) return
  fs.writeFileSync(
    readmePath,
    `${readme.trimEnd()}${EOL}${EOL}${README_SECTION}${EOL}`,
  )
}
