import fs from "fs"
import { EOL } from "os"
import path from "path"

import {
  CAPACITOR_VERSION,
  INDENTATION,
  TYPESCRIPT_VERSION,
} from "./constants.js"
import { copyDir, toJavaIdentifier } from "./file.js"

export function addMobileSupport(targetDir, pkg, projectName, templatesRoot) {
  pkg.dependencies ??= {}
  pkg.devDependencies ??= {}
  pkg.scripts ??= {}

  pkg.dependencies["@capacitor/core"] = CAPACITOR_VERSION
  pkg.devDependencies["@capacitor/android"] = CAPACITOR_VERSION
  pkg.devDependencies["@capacitor/cli"] = CAPACITOR_VERSION
  pkg.devDependencies["@capacitor/ios"] = CAPACITOR_VERSION
  pkg.devDependencies["typescript"] ??= TYPESCRIPT_VERSION

  pkg.scripts.cap = "cap"
  pkg.scripts["mobile:init:ios"] = "cap add ios"
  pkg.scripts["mobile:init:android"] = "cap add android"
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
  writeAppSiteAssociation(targetDir, projectName)
  includeInNodeProject(targetDir, "capacitor.config.ts")

  appendMobileSetupToReadme(targetDir)
}

export function appendMobileSetupToReadme(targetDir) {
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

Then sync and open the native project:

\`\`\`bash
pnpm mobile:sync
pnpm mobile:android
# or
pnpm mobile:ios
\`\`\`

### Opening links in the app

With Universal Links, a link to the app's domain opens the installed app instead of the browser, and the router goes to the link's path. The app's side is done; three steps are yours:

1. Replace \`TEAM_ID\` in \`public/.well-known/apple-app-site-association\` with your Apple Developer Team ID, and keep the bundle ID in step with \`appId\` in \`capacitor.config.ts\`. Add paths that must stay in the browser as \`{ "/": "/path*", "exclude": true }\` before the last entry.
2. In Xcode, select the app target, open **Signing & Capabilities**, add **Associated Domains**, and enter \`applinks:your-domain.com\`.
3. Serve the file as JSON, without a redirect. On Vercel, add this to \`vercel.json\`:

\`\`\`json
{
  "headers": [
    {
      "source": "/.well-known/apple-app-site-association",
      "headers": [{ "key": "Content-Type", "value": "application/json" }]
    }
  ]
}
\`\`\`

Test on a device by tapping a link in Notes or Messages; typing it in Safari does not count. Apple caches the file, so a change can take a few hours to arrive. Android App Links need \`/.well-known/assetlinks.json\` with your signing certificate's SHA-256 fingerprint and an intent filter in \`AndroidManifest.xml\`; see https://developer.android.com/training/app-links.

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
function writeAppSiteAssociation(targetDir, projectName) {
  const association = {
    applinks: {
      details: [
        {
          appIDs: [`TEAM_ID.${appIdOf(projectName)}`],
          components: [{ "#": "*access_token*", exclude: true }, { "/": "*" }],
        },
      ],
    },
  }
  const dir = path.join(targetDir, "public", ".well-known")
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(
    path.join(dir, "apple-app-site-association"),
    JSON.stringify(association, null, INDENTATION) + EOL,
  )
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
