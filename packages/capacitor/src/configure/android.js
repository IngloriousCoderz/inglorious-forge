import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

import { intentFilterData } from "./well-known.js"

const ACTIVITY = "manifest/application/activity"
const APPLICATION = "manifest/application"
const MANIFEST = "manifest"
const APP_LINKS_FILTER = `${ACTIVITY}/intent-filter[@android:autoVerify='true']`
const ANALYTICS_OFF = [
  "firebase_analytics_collection_enabled",
  "google_analytics_adid_collection_enabled",
]
const AD_ID_PERMISSIONS = [
  "com.google.android.gms.permission.AD_ID",
  "android.permission.ACCESS_ADSERVICES_AD_ID",
]
const TOOLS_NAMESPACE = "http://schemas.android.com/tools"
const GOOGLE_SERVICES = "google-services.json"
const KEYSTORES = ["*.jks", "*.keystore"]

/**
 * Applies the settings to the Android project: App Links, Analytics off until
 * consent and without the advertising ID, extra permissions, the Firebase file, and keystores kept out of git.
 *
 * @param {import("@trapezedev/project").MobileProject} project
 * @param {import("../../types/index.d.ts").ProjectSettings} settings
 */
export function configureAndroid(project, settings) {
  const manifest = project.android.getAndroidManifest()
  const androidRoot = path.join(settings.root, "android")

  if (manifest.find(APP_LINKS_FILTER)?.length) {
    manifest.deleteNodes(APP_LINKS_FILTER)
  }
  if (settings.appLinks) {
    manifest.injectFragment(ACTIVITY, appLinksFilter(settings.appLinks))
  }

  if (settings.hasAnalytics) {
    for (const name of ANALYTICS_OFF) {
      if (
        manifest.find(`${APPLICATION}/meta-data[@android:name='${name}']`)
          ?.length
      ) {
        continue
      }
      manifest.injectFragment(
        APPLICATION,
        `<meta-data android:name="${name}" android:value="false" />`,
      )
    }
    removeAdIdPermissions(manifest)
  }

  for (const permission of settings.android.permissions) {
    if (
      manifest.find(
        `${MANIFEST}/uses-permission[@android:name='${permission}']`,
      )?.length
    ) {
      continue
    }
    manifest.injectFragment(
      MANIFEST,
      `<uses-permission android:name="${permission}" />`,
    )
  }

  const googleServices = path.join(settings.root, GOOGLE_SERVICES)
  if (existsSync(googleServices)) {
    copyFileSync(googleServices, path.join(androidRoot, "app", GOOGLE_SERVICES))
  }

  ignoreKeystores(path.join(androidRoot, ".gitignore"))
}

function removeAdIdPermissions(manifest) {
  manifest.setAttrs(MANIFEST, { "xmlns:tools": TOOLS_NAMESPACE })
  for (const permission of AD_ID_PERMISSIONS) {
    if (
      manifest.find(
        `${MANIFEST}/uses-permission[@android:name='${permission}']`,
      )?.length
    ) {
      continue
    }
    manifest.injectFragment(
      MANIFEST,
      `<uses-permission android:name="${permission}" tools:node="remove" />`,
    )
  }
}

function appLinksFilter(appLinks) {
  const data = intentFilterData(appLinks)
    .map(
      (attributes) =>
        `<data ${Object.entries(attributes)
          .map(([name, value]) => `${name}="${value}"`)
          .join(" ")} />`,
    )
    .join("")

  return `<intent-filter android:autoVerify="true"><action android:name="android.intent.action.VIEW" /><category android:name="android.intent.category.DEFAULT" /><category android:name="android.intent.category.BROWSABLE" />${data}</intent-filter>`
}

function ignoreKeystores(file) {
  if (!existsSync(file)) return

  const source = readFileSync(file, "utf8")
  const lines = source.split("\n").map((line) => {
    const uncommented = line.replace(/^#/, "")
    return KEYSTORES.includes(uncommented) ? uncommented : line
  })
  const missing = KEYSTORES.filter((pattern) => !lines.includes(pattern))
  const next = [...lines, ...missing].join("\n")
  if (next !== source) writeFileSync(file, next)
}
