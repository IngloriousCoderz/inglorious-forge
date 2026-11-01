// Runs after every `cap sync`: `cap add` creates the native projects, and they
// must start with Analytics off, or they measure from launch, before anyone
// agreed. createAnalytics turns it on once the user says yes.

import { existsSync, readFileSync, writeFileSync } from "node:fs"

insertBefore(
  "android/app/src/main/AndroidManifest.xml",
  "</application>",
  `    <meta-data android:name="firebase_analytics_collection_enabled" android:value="false" />
        <meta-data android:name="google_analytics_adid_collection_enabled" android:value="false" />
    `,
)

insertBefore(
  "ios/App/App/Info.plist",
  "</dict>\n</plist>",
  `	<key>FIREBASE_ANALYTICS_COLLECTION_ENABLED</key>
	<false/>
	<key>GOOGLE_ANALYTICS_IDFV_COLLECTION_ENABLED</key>
	<false/>
`,
)

function insertBefore(file, closing, settings) {
  if (!existsSync(file)) return
  const source = readFileSync(file, "utf-8")
  if (source.includes("ANALYTICS_COLLECTION_ENABLED")) return
  if (source.includes("firebase_analytics_collection_enabled")) return
  writeFileSync(file, source.replace(closing, `${settings}${closing}`))
}
