import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { configure } from "./index.js"

const FIXTURES = fileURLToPath(new URL("./fixtures", import.meta.url))
const CAPACITOR_CONFIG = JSON.stringify({
  appId: "com.example.app",
  appName: "Example",
})

describe("configure", () => {
  let root

  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), "inglorious-capacitor-"))
    cpSync(FIXTURES, root, { recursive: true })
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it("leaves a project without settings as it was, but for keystores", async () => {
    writePackage(root, {})
    const before = snapshot(root)

    await configure({ root, env: { CAPACITOR_CONFIG } })

    const after = snapshot(root)
    expect(after.entitlements).toBeNull()
    expect(after.manifest).not.toContain("autoVerify")
    expect(after.plist).not.toContain("UIBackgroundModes")
    expect(after.appDelegate).toBe(before.appDelegate)
    expect(after.gitignore).toMatch(/^\*\.jks$/m)
    expect(existsSync(path.join(root, "public"))).toBe(false)
  })

  it("applies every setting, and changes nothing when run again", async () => {
    writePackage(root, {
      dependencies: {
        "@capacitor-firebase/messaging": "^8.0.0",
        "@capacitor-firebase/analytics": "^8.0.0",
      },
      native: {
        appLinks: {
          domain: "app.example.com",
          paths: ["/", "/jobs*"],
          exclude: ["#*access_token*"],
        },
        ios: {
          teamId: "ABCDE12345",
          infoPlist: { NSMicrophoneUsageDescription: "Records your voice" },
        },
        android: {
          sha256: ["AA:BB"],
          permissions: ["android.permission.RECORD_AUDIO"],
        },
      },
    })
    writeFileSync(path.join(root, "google-services.json"), "{}")
    writeFileSync(path.join(root, "GoogleService-Info.plist"), "<plist/>")

    await configure({ root, env: { CAPACITOR_CONFIG } })
    const first = snapshot(root)
    await configure({ root, env: { CAPACITOR_CONFIG } })

    expect(snapshot(root)).toEqual(first)

    expect(first.manifest).toContain(
      '<data android:scheme="https" android:host="app.example.com" />',
    )
    expect(first.manifest).toContain('<data android:pathPrefix="/jobs" />')
    expect(first.manifest).toContain(
      '<meta-data android:name="firebase_analytics_collection_enabled" android:value="false" />',
    )
    expect(first.manifest).toContain(
      '<uses-permission android:name="android.permission.RECORD_AUDIO" />',
    )
    expect(first.googleServices).toBe("{}")

    expect(first.pbxproj).toContain("DEVELOPMENT_TEAM = ABCDE12345;")
    expect(first.pbxproj).toContain(
      "CODE_SIGN_ENTITLEMENTS = App/App.entitlements;",
    )
    expect(first.pbxproj).toContain("GoogleService-Info.plist in Resources")
    expect(first.entitlements).toContain("applinks:app.example.com")
    expect(first.entitlements).toContain("<key>aps-environment</key>")
    expect(first.plist).toContain("<string>remote-notification</string>")
    expect(first.plist).toContain("<string>Records your voice</string>")
    expect(first.plist).toContain(
      "<key>FIREBASE_ANALYTICS_COLLECTION_ENABLED</key>",
    )
    expect(first.appDelegate).toContain(
      "didRegisterForRemoteNotificationsWithDeviceToken",
    )

    expect(JSON.parse(first.association).applinks.details[0].appIDs).toEqual([
      "ABCDE12345.com.example.app",
    ])
    expect(JSON.parse(first.assetLinks)[0].target.package_name).toBe(
      "com.example.app",
    )
  })

  it("moves App Links to a new domain", async () => {
    writePackage(root, { native: { appLinks: { domain: "old.example.com" } } })
    await configure({ root, env: { CAPACITOR_CONFIG } })

    writePackage(root, { native: { appLinks: { domain: "new.example.com" } } })
    await configure({ root, env: { CAPACITOR_CONFIG } })

    const { manifest, entitlements } = snapshot(root)
    expect(manifest).not.toContain("old.example.com")
    expect(manifest.match(/autoVerify/g)).toHaveLength(1)
    expect(entitlements).not.toContain("old.example.com")
    expect(entitlements).toContain("applinks:new.example.com")
  })

  it("keeps the formatting of App Links files with the same content", async () => {
    writePackage(root, {
      native: {
        appLinks: { domain: "app.example.com" },
        android: { sha256: ["AA:BB"] },
      },
    })
    await configure({ root, env: { CAPACITOR_CONFIG } })
    const file = path.join(root, "public", ".well-known", "assetlinks.json")
    const compact = JSON.stringify(JSON.parse(readFileSync(file, "utf8")))
    writeFileSync(file, compact)

    await configure({ root, env: { CAPACITOR_CONFIG } })

    expect(readFileSync(file, "utf8")).toBe(compact)
  })

  it("turns on iOS swipe back with a view controller of its own", async () => {
    writePackage(root, { native: { ios: { swipeBack: true } } })

    await configure({ root, env: { CAPACITOR_CONFIG } })
    const first = snapshot(root)
    await configure({ root, env: { CAPACITOR_CONFIG } })

    expect(snapshot(root)).toEqual(first)
    expect(first.viewController).toContain(
      "webView?.allowsBackForwardNavigationGestures = true",
    )
    expect(first.storyboard).toContain('customClass="MainViewController"')
    expect(first.pbxproj).toContain("MainViewController.swift in Sources")
  })

  it("configures only the platform Capacitor is syncing", async () => {
    writePackage(root, { native: { ios: { teamId: "ABCDE12345" } } })

    const platforms = await configure({
      root,
      env: { CAPACITOR_CONFIG, CAPACITOR_PLATFORM_NAME: "web" },
    })

    expect(platforms).toEqual([])
    expect(snapshot(root).pbxproj).not.toContain("DEVELOPMENT_TEAM")
  })
})

function writePackage(root, pkg) {
  writeFileSync(path.join(root, "package.json"), JSON.stringify(pkg))
}

function snapshot(root) {
  const read = (...segments) => {
    const file = path.join(root, ...segments)
    return existsSync(file) ? readFileSync(file, "utf8") : null
  }

  return {
    manifest: read("android", "app", "src", "main", "AndroidManifest.xml"),
    gitignore: read("android", ".gitignore"),
    googleServices: read("android", "app", "google-services.json"),
    pbxproj: read("ios", "App", "App.xcodeproj", "project.pbxproj"),
    plist: read("ios", "App", "App", "Info.plist"),
    entitlements: read("ios", "App", "App", "App.entitlements"),
    appDelegate: read("ios", "App", "App", "AppDelegate.swift"),
    viewController: read("ios", "App", "App", "MainViewController.swift"),
    storyboard: read("ios", "App", "App", "Base.lproj", "Main.storyboard"),
    association: read("public", ".well-known", "apple-app-site-association"),
    assetLinks: read("public", ".well-known", "assetlinks.json"),
  }
}
