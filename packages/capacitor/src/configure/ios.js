import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

import plist from "plist"

const BUILDS = ["Debug", "Release"]
const ASSOCIATED_DOMAINS = "com.apple.developer.associated-domains"
const APS_ENVIRONMENT = "aps-environment"
const APP_LINKS_PREFIX = "applinks:"
const REMOTE_NOTIFICATION = "remote-notification"
const BACKGROUND_MODES = "UIBackgroundModes"
const ANALYTICS_OFF = {
  FIREBASE_ANALYTICS_COLLECTION_ENABLED: false,
  GOOGLE_ANALYTICS_IDFV_COLLECTION_ENABLED: false,
}
const GOOGLE_SERVICE_INFO = "GoogleService-Info.plist"
const PRIVACY_MANIFEST = "PrivacyInfo.xcprivacy"
const APP_GROUP = "App"
const APP_DELEGATE = "AppDelegate.swift"
const MAIN_VIEW_CONTROLLER = "MainViewController.swift"
const MAIN_STORYBOARD = path.join("Base.lproj", "Main.storyboard")
const BRIDGE_CLASS =
  'customClass="CAPBridgeViewController" customModule="Capacitor"'
const MAIN_CLASS =
  'customClass="MainViewController" customModule="App" customModuleProvider="target"'
const SWIPE_BACK = "allowsBackForwardNavigationGestures"
const MAIN_VIEW_CONTROLLER_SOURCE = `import Capacitor
import UIKit

class MainViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        webView?.${SWIPE_BACK} = true
    }
}
`
const APP_DELEGATE_CLASS_END = /\n}\s*$/
const PUSH_METHODS = `
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }

    func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable: Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        NotificationCenter.default.post(name: Notification.Name("didReceiveRemoteNotification"), object: completionHandler, userInfo: userInfo)
    }
`

/**
 * Applies the settings to the iOS project: the signing team, Associated
 * Domains, push (entitlement, background mode, AppDelegate), Analytics off
 * until consent, extra Info.plist entries, and the Firebase file.
 *
 * @param {import("@trapezedev/project").MobileProject} project
 * @param {import("../../types/index.d.ts").ProjectSettings} settings
 */
export async function configureIos(project, settings) {
  const ios = project.ios
  const appRoot = path.join(settings.root, "ios", "App", "App")

  if (settings.ios.teamId) {
    for (const build of BUILDS) {
      if (
        ios.getBuildProperty(null, build, "DEVELOPMENT_TEAM") !==
        settings.ios.teamId
      ) {
        ios.setBuildProperty(
          null,
          build,
          "DEVELOPMENT_TEAM",
          settings.ios.teamId,
        )
      }
    }
  }

  await configureEntitlements(ios, settings)

  const infoPlist = await readInfoPlist(ios)
  const entries = {
    ...(settings.hasAnalytics ? ANALYTICS_OFF : {}),
    ...settings.ios.infoPlist,
  }
  if (settings.hasPush) {
    const modes = infoPlist[BACKGROUND_MODES] ?? []
    if (!modes.includes(REMOTE_NOTIFICATION)) {
      entries[BACKGROUND_MODES] = [...modes, REMOTE_NOTIFICATION]
    }
  }
  const changed = Object.fromEntries(
    Object.entries(entries).filter(
      ([key, value]) =>
        JSON.stringify(infoPlist[key]) !== JSON.stringify(value),
    ),
  )
  if (Object.keys(changed).length) {
    await ios.updateInfoPlist(null, null, changed, { replace: true })
  }

  const googleServiceInfo = path.join(settings.root, GOOGLE_SERVICE_INFO)
  if (existsSync(googleServiceInfo)) {
    copyFileSync(googleServiceInfo, path.join(appRoot, GOOGLE_SERVICE_INFO))
    if (
      !readFileSync(pbxprojPath(settings.root), "utf8").includes(
        GOOGLE_SERVICE_INFO,
      )
    ) {
      await ios.addFile(path.join("App", GOOGLE_SERVICE_INFO))
    }
  }

  if (settings.hasPush) {
    addPushMethods(path.join(appRoot, APP_DELEGATE))
  }

  if (settings.ios.privacyManifest || settings.accessedApiTypes.length) {
    writePrivacyManifest(path.join(appRoot, PRIVACY_MANIFEST), settings)
    if (
      !readFileSync(pbxprojPath(settings.root), "utf8").includes(
        PRIVACY_MANIFEST,
      )
    ) {
      addResource(ios, PRIVACY_MANIFEST)
    }
  }

  if (settings.ios.swipeBack) {
    await enableSwipeBack(ios, settings.root, appRoot)
  }
}

/**
 * Writes the app's privacy manifest: what is already in it, what the app
 * declares in `ios.privacyManifest`, and the required-reason APIs its plugins
 * use without declaring them.
 */
function writePrivacyManifest(file, settings) {
  const current = existsSync(file)
    ? plist.parse(readFileSync(file, "utf8"))
    : {}
  const declared = settings.ios.privacyManifest ?? {}
  const next = {
    ...current,
    ...declared,
    NSPrivacyTracking:
      declared.NSPrivacyTracking ?? current.NSPrivacyTracking ?? false,
    NSPrivacyTrackingDomains: union(
      current.NSPrivacyTrackingDomains,
      declared.NSPrivacyTrackingDomains,
    ),
    NSPrivacyCollectedDataTypes:
      declared.NSPrivacyCollectedDataTypes ??
      current.NSPrivacyCollectedDataTypes ??
      [],
    NSPrivacyAccessedAPITypes: mergeApiTypes([
      ...(current.NSPrivacyAccessedAPITypes ?? []),
      ...(declared.NSPrivacyAccessedAPITypes ?? []),
      ...settings.accessedApiTypes,
    ]),
  }
  if (JSON.stringify(next) === JSON.stringify(current)) return
  writeFileSync(file, plist.build(next))
}

function mergeApiTypes(types) {
  const byType = new Map()
  for (const type of types) {
    const name = type.NSPrivacyAccessedAPIType
    byType.set(name, {
      NSPrivacyAccessedAPIType: name,
      NSPrivacyAccessedAPITypeReasons: union(
        byType.get(name)?.NSPrivacyAccessedAPITypeReasons,
        type.NSPrivacyAccessedAPITypeReasons,
      ),
    })
  }
  return [...byType.values()]
}

function union(first = [], second = []) {
  return [...new Set([...first, ...second])]
}

// Trapeze's addFile compiles any file that is not a .plist or .strings, and a
// privacy manifest has to be copied into the bundle instead.
function addResource(ios, fileName) {
  const groups = ios.pbxProject?.hash.project.objects.PBXGroup ?? {}
  const appGroup = Object.entries(groups).find(
    ([, group]) =>
      group.isa === "PBXGroup" &&
      (group.name === APP_GROUP || group.path === APP_GROUP),
  )
  const [appGroupId] = appGroup ?? []
  ios.addResourceFile(fileName, appGroupId)
  const references = ios.pbxProject?.hash.project.objects.PBXFileReference ?? {}
  for (const reference of Object.values(references)) {
    if (reference?.path !== `"${fileName}"`) continue
    reference.lastKnownFileType = "text.xml"
    for (const [key, value] of Object.entries(reference)) {
      if (value === undefined) delete reference[key]
    }
  }
  ios.markPbxModified()
}

async function enableSwipeBack(ios, root, appRoot) {
  const controller = path.join(appRoot, MAIN_VIEW_CONTROLLER)
  if (!existsSync(controller)) {
    writeFileSync(controller, MAIN_VIEW_CONTROLLER_SOURCE)
  } else if (!readFileSync(controller, "utf8").includes(SWIPE_BACK)) {
    console.warn(
      `${MAIN_VIEW_CONTROLLER} exists without ${SWIPE_BACK}: set it to true in capacitorDidLoad() for swipe back`,
    )
  }

  if (!readFileSync(pbxprojPath(root), "utf8").includes(MAIN_VIEW_CONTROLLER)) {
    await ios.addFile(path.join("App", MAIN_VIEW_CONTROLLER))
  }

  const storyboard = path.join(appRoot, MAIN_STORYBOARD)
  if (existsSync(storyboard)) {
    const source = readFileSync(storyboard, "utf8")
    if (source.includes(BRIDGE_CLASS)) {
      writeFileSync(storyboard, source.replace(BRIDGE_CLASS, MAIN_CLASS))
    }
  }
}

async function configureEntitlements(ios, settings) {
  for (const build of BUILDS) {
    const current = (await ios.getEntitlements(null, build)) ?? {}
    const next = { ...current }

    const otherDomains = (current[ASSOCIATED_DOMAINS] ?? []).filter(
      (domain) => !domain.startsWith(APP_LINKS_PREFIX),
    )
    const domains = settings.appLinks
      ? [...otherDomains, `${APP_LINKS_PREFIX}${settings.appLinks.domain}`]
      : otherDomains
    if (domains.length) next[ASSOCIATED_DOMAINS] = domains
    else delete next[ASSOCIATED_DOMAINS]

    if (settings.hasPush) next[APS_ENVIRONMENT] ??= "development"

    if (JSON.stringify(next) === JSON.stringify(current)) continue
    await ios.setEntitlements(null, build, next)
  }
}

async function readInfoPlist(ios) {
  const filename = await ios.getInfoPlistFilename(null)
  return plist.parse(readFileSync(filename, "utf8"))
}

function pbxprojPath(root) {
  return path.join(root, "ios", "App", "App.xcodeproj", "project.pbxproj")
}

function addPushMethods(file) {
  if (!existsSync(file)) return

  const source = readFileSync(file, "utf8")
  if (source.includes("didRegisterForRemoteNotificationsWithDeviceToken"))
    return

  writeFileSync(
    file,
    source.replace(APP_DELEGATE_CLASS_END, `\n${PUSH_METHODS}}\n`),
  )
}
