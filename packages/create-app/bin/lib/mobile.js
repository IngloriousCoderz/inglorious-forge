import fs from "fs"
import { EOL } from "os"
import path from "path"

import { CAPACITOR_VERSION } from "./constants.js"
import { toJavaIdentifier } from "./file.js"

export function addMobileSupport(targetDir, pkg, projectName) {
  pkg.dependencies ??= {}
  pkg.devDependencies ??= {}
  pkg.scripts ??= {}

  pkg.dependencies["@capacitor/core"] = CAPACITOR_VERSION
  pkg.devDependencies["@capacitor/android"] = CAPACITOR_VERSION
  pkg.devDependencies["@capacitor/cli"] = CAPACITOR_VERSION
  pkg.devDependencies["@capacitor/ios"] = CAPACITOR_VERSION

  pkg.scripts.cap = "cap"
  pkg.scripts["mobile:sync"] = "pnpm build && cap sync"
  pkg.scripts["mobile:ios"] = "pnpm build && cap run ios"
  pkg.scripts["mobile:android"] = "pnpm build && cap run android"

  fs.writeFileSync(
    path.join(targetDir, "capacitor.config.ts"),
    createCapacitorConfigSource(projectName),
  )

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
`

  fs.writeFileSync(
    readmePath,
    `${readme.trimEnd()}${EOL}${EOL}${mobileReadme.trim()}${EOL}`,
  )
}

export function createCapacitorConfigSource(projectName) {
  const appId = `com.inglorious.${toJavaIdentifier(projectName)}`

  return `import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "${appId}",
  appName: "${projectName}",
  webDir: "dist",
}

export default config
`
}
