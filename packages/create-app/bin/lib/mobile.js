import fs from "fs"
import { EOL } from "os"
import path from "path"

import {
  CAPACITOR_HAPTICS_VERSION,
  CAPACITOR_VERSION,
  INDENTATION,
  TYPESCRIPT_VERSION,
} from "./constants.js"
import { copyDir, toJavaIdentifier } from "./file.js"

const WELL_KNOWN_FILES = ["apple-app-site-association", "assetlinks.json"]

export function addMobileSupport(
  targetDir,
  pkg,
  projectName,
  templatesRoot,
  { routing = false } = {},
) {
  pkg.dependencies ??= {}
  pkg.devDependencies ??= {}
  pkg.scripts ??= {}

  pkg.dependencies["@capacitor/core"] = CAPACITOR_VERSION
  pkg.dependencies["@capacitor/haptics"] = CAPACITOR_HAPTICS_VERSION
  pkg.devDependencies["@capacitor/android"] = CAPACITOR_VERSION
  pkg.devDependencies["@capacitor/cli"] = CAPACITOR_VERSION
  pkg.devDependencies["@capacitor/ios"] = CAPACITOR_VERSION
  pkg.devDependencies["@inglorious/capacitor"] = "workspace:*"
  pkg.devDependencies["typescript"] ??= TYPESCRIPT_VERSION

  pkg.scripts.cap = "cap"
  pkg.scripts["mobile:init:ios"] =
    "cap add ios && inglorious-capacitor assets --ios"
  pkg.scripts["mobile:init:android"] =
    "cap add android && inglorious-capacitor assets --android"
  pkg.scripts["mobile:assets"] = "inglorious-capacitor assets"
  pkg.scripts["capacitor:sync:after"] = "inglorious-capacitor configure"
  pkg.scripts["mobile:sync"] = "pnpm build && cap sync"
  pkg.scripts["mobile:ios"] = "pnpm build && cap run ios"
  pkg.scripts["mobile:android"] = "pnpm build && cap run android"
  // Vite never overrides a variable already set, so .env beats .env.local.
  pkg.scripts["build:release"] =
    "node --env-file-if-exists=.env node_modules/vite/bin/vite.js build"
  pkg.scripts["mobile:release"] =
    "node scripts/native-version.mjs && pnpm build:release && cap sync"

  copyDir(path.join(templatesRoot, "features/mobile"), targetDir)

  fs.writeFileSync(
    path.join(targetDir, "capacitor.config.ts"),
    createCapacitorConfigSource(projectName),
  )
  pkg.native = nativeSettings({ routing })
  if (routing) serveWellKnownAsJson(targetDir)
  includeInNodeProject(targetDir, "capacitor.config.ts")

  appendMobileSetupToReadme(targetDir, { routing })
}

export function appendMobileSetupToReadme(targetDir, { routing = false } = {}) {
  const readmePath = path.join(targetDir, "README.md")
  if (!fs.existsSync(readmePath)) {
    return
  }

  const readme = fs.readFileSync(readmePath, "utf-8")
  if (readme.includes("## Mobile Setup")) {
    return
  }

  const mobileReadme = `
## Mobile Setup

This project includes Capacitor for Android and iOS support.

Please note that mobile development depends on external platform tooling that is not installed or managed by the CLI. If the app does not just work after scaffolding, it is usually because one or more native prerequisites are missing on the machine.

### Android

Before you run the native apps, make sure you have:

- Android Studio installed with the Android SDK: https://developer.android.com/studio
- A Java Development Kit compatible with Capacitor. Capacitor is currently known to work reliably with JDK 21, so prefer JDK 21 over newer versions if you run into Java compatibility errors.
- The SDK path available via ANDROID_HOME (for example, on macOS this is often $HOME/Library/Android/sdk)

On macOS, the following shell variables are commonly needed:

\`\`\`bash
export JAVA_HOME="/path/to/jdk-21"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
\`\`\`

### iOS

For iOS you also need the Apple toolchain and device setup on a Mac:

- Xcode from the App Store
- iOS development tools and simulator components (this can be very large, often multiple GB)
- A valid Apple Developer team / signing identity in Xcode
- Device trust setup for your iPhone in Settings > General > VPN & Device Management

The most common first-time setup commands are:

\`\`\`bash
sudo xcode-select -switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
\`\`\`

If you are using a physical device, you may also need to approve the developer certificate on the device and ensure the app is signed with a valid team.

### Official resources

- Android: https://capacitorjs.com/docs/android
- iOS: https://capacitorjs.com/docs/ios
- Android Studio: https://developer.android.com/studio
- Xcode: https://developer.apple.com/xcode/

Then create the native projects you need, once. Each starts with your logo as its icon and splash screen:

\`\`\`bash
pnpm mobile:init:android
pnpm mobile:init:ios
\`\`\`

Then sync and open the native project:

\`\`\`bash
pnpm mobile:sync
pnpm mobile:android
# or
pnpm mobile:ios
\`\`\`

### Native settings

Leave \`android/\` and \`ios/\` to the tools: what the app needs from them is in \`native\` in \`package.json\`, and \`inglorious-capacitor configure\` writes it into both projects after every \`cap sync\`. Set \`native.ios.teamId\` to your Apple Developer Team ID, so Xcode signs the app without asking. \`native.ios.infoPlist\` adds Info.plist entries, such as the text iOS shows when the app asks for the microphone (\`NSMicrophoneUsageDescription\`), and \`native.android.permissions\` adds Android permissions, such as \`android.permission.RECORD_AUDIO\`. With routing, \`native.ios.swipeBack\` lets a swipe from the left edge go back, as in other iOS apps. \`ITSAppUsesNonExemptEncryption: false\` tells App Store Connect that the app uses no encryption beyond HTTPS: remove it if that stops being true.

### Icons and splash screens

\`pnpm mobile:assets\` makes every icon and splash screen from \`public/logo.svg\` or \`public/logo.png\`, centred on \`native.assets.background\` (white by default) and, for the dark splash screen, \`native.assets.backgroundDark\`. \`iconScale\` and \`splashScale\` set the logo's width as a share of the icon (0.6) and of the splash screen (0.3). Run it again after changing the logo, and commit the result.
${routing ? APP_LINKS_README : ""}
### Releasing

The version users see comes from \`package.json\`, the same on the web, Android and iOS. The build number is shared by both native apps and must go up with every store upload.

1. Describe each change as you make it with \`pnpm changeset\`. When a release is due, \`pnpm release:version\` raises the version and writes \`CHANGELOG.md\`. Skip this to upload another build of the same version, for example to TestFlight.
2. Run \`pnpm mobile:release\`. It copies the version into both native projects, raises the build number, builds with the production values in \`.env\` (ignoring \`.env.local\`), and syncs. Commit what it changed.
3. Upload. In Xcode, use **Product → Archive**, then **Distribute App → Custom → App Store Connect → Upload**, and untick **Manage Version and Build Number** so the store gets the project's build number. In Android Studio, use **Build → Generate Signed App Bundle**.
`

  fs.writeFileSync(
    readmePath,
    `${readme.trimEnd()}${EOL}${EOL}${mobileReadme.trim()}${EOL}`,
  )
}

const APP_LINKS_README = `
### Opening links in the app

With Universal Links (iOS) and App Links (Android), a link to the app's domain opens the installed app instead of the browser, and the router goes to the link's path. Fill in \`native.appLinks.domain\`, then:

1. For iOS, set \`native.ios.teamId\`. \`pnpm mobile:sync\` adds the domain to the app's Associated Domains and writes \`public/.well-known/apple-app-site-association\`. Links in \`native.appLinks.exclude\` stay in the browser: by default, the ones carrying a sign-in token.
2. For Android, add the SHA-256 fingerprints of the keys that sign the app to \`native.android.sha256\`: Google's app signing key and your upload key, both under **Test and release → App integrity → App signing** in Play Console. \`pnpm mobile:sync\` writes \`public/.well-known/assetlinks.json\` and the intent filter. Android can't exclude a link: it opens the paths in \`native.appLinks.paths\`, \`["/*"]\` by default, so list the ones that should open the app instead, such as \`["/", "/jobs*"]\`.
3. Deploy the site, so the domain serves both files. \`vercel.json\` already serves them as JSON.

Test on a device by tapping a link in Notes or Messages; typing it in Safari does not count. Both files are cached, so a change can take a few hours to arrive, and Android checks the domain when the app is installed or updated: \`adb shell pm get-app-links <app id>\` should say \`verified\`.
`

export function createCapacitorConfigSource(
  projectName,
  { liveUpdate = false } = {},
) {
  const appId = appIdOf(projectName)

  if (!liveUpdate) {
    return `import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "${appId}",
  appName: "${projectName}",
  webDir: "dist",
}

export default config
`
  }

  return `import { existsSync, readFileSync } from "node:fs"

import type { CapacitorConfig } from "@capacitor/cli"

const LIVE_UPDATE_PUBLIC_KEY = "live-update.pub.pem"
const READY_TIMEOUT_MS = 10_000

// One line, as the plugin reads it. Without it, any bundle would be accepted:
// run \`pnpm live:keys\` before the first store build.
const publicKey = existsSync(LIVE_UPDATE_PUBLIC_KEY)
  ? readFileSync(LIVE_UPDATE_PUBLIC_KEY, "utf8").replaceAll("\\n", "")
  : undefined

const config: CapacitorConfig = {
  appId: "${appId}",
  appName: "${projectName}",
  webDir: "dist",
  plugins: {
    LiveUpdate: {
      publicKey,
      readyTimeout: READY_TIMEOUT_MS,
      autoBlockRolledBackBundles: true,
      autoDeleteBundles: true,
    },
  },
}

export default config
`
}

function appIdOf(projectName) {
  return `com.inglorious.${toJavaIdentifier(projectName)}`
}

// Links carrying a session token, from sign-up and password-reset emails,
// stay in the browser, where the sign-in flow expects them.
function nativeSettings({ routing }) {
  return {
    ...(routing
      ? { appLinks: { domain: "", exclude: ["#*access_token*"] } }
      : {}),
    ios: {
      teamId: "",
      infoPlist: { ITSAppUsesNonExemptEncryption: false },
      ...(routing ? { swipeBack: true } : {}),
    },
    android: { sha256: [], permissions: [] },
    assets: { background: "#ffffff", backgroundDark: "#121212" },
  }
}

function serveWellKnownAsJson(targetDir) {
  const vercelPath = path.join(targetDir, "vercel.json")
  if (!fs.existsSync(vercelPath)) return

  const vercel = JSON.parse(fs.readFileSync(vercelPath, "utf-8"))
  vercel.headers = [
    ...(vercel.headers ?? []),
    ...WELL_KNOWN_FILES.map((file) => ({
      source: `/.well-known/${file}`,
      headers: [{ key: "Content-Type", value: "application/json" }],
    })),
  ]
  fs.writeFileSync(vercelPath, JSON.stringify(vercel, null, INDENTATION) + EOL)
}

function includeInNodeProject(targetDir, file) {
  const tsconfigPath = path.join(targetDir, "tsconfig.node.json")
  if (!fs.existsSync(tsconfigPath)) return

  const tsconfig = fs.readFileSync(tsconfigPath, "utf-8")
  if (tsconfig.includes(`"${file}"`)) return
  fs.writeFileSync(
    tsconfigPath,
    tsconfig.replace(/("include": \[[^\]]*)\]/, `$1, "${file}"]`),
  )
}
