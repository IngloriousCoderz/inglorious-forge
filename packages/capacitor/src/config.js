import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import process from "node:process"
import { pathToFileURL } from "node:url"

const CAPACITOR_CONFIG_FILES = [
  "capacitor.config.ts",
  "capacitor.config.js",
  "capacitor.config.json",
]
const PUSH_PLUGIN = "@capacitor-firebase/messaging"
const ANALYTICS_PLUGIN = "@capacitor-firebase/analytics"

/**
 * Everything `configure` and `assets` act on: the app's id and name from the
 * Capacitor config, the `native` settings from `package.json`, and the Firebase
 * plugins the app depends on.
 *
 * @param {string} root The project's folder.
 * @param {NodeJS.ProcessEnv} [env] Capacitor hands its config to hooks here.
 * @returns {Promise<import("../types/index.d.ts").ProjectSettings>}
 */
export async function readSettings(root, env = process.env) {
  const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"))
  const capacitor = env.CAPACITOR_CONFIG
    ? JSON.parse(env.CAPACITOR_CONFIG)
    : await importCapacitorConfig(root)
  const dependencies = { ...pkg.dependencies, ...pkg.devDependencies }
  const native = pkg.native ?? {}

  return {
    root,
    appId: capacitor.appId,
    appName: capacitor.appName,
    appLinks: native.appLinks?.domain
      ? normalizeAppLinks(native.appLinks)
      : null,
    ios: { teamId: null, infoPlist: {}, ...native.ios },
    android: { sha256: [], permissions: [], ...native.android },
    assets: native.assets ?? {},
    hasPush: PUSH_PLUGIN in dependencies,
    hasAnalytics: ANALYTICS_PLUGIN in dependencies,
  }
}

async function importCapacitorConfig(root) {
  const file = CAPACITOR_CONFIG_FILES.map((name) => path.join(root, name)).find(
    (candidate) => existsSync(candidate),
  )
  if (!file) {
    throw new Error(`No Capacitor config found in ${root}`)
  }
  if (file.endsWith(".json")) {
    return JSON.parse(readFileSync(file, "utf8"))
  }
  const { default: config } = await import(pathToFileURL(file).href)
  return config
}

function normalizeAppLinks({ domain, paths = ["/*"], exclude = [] }) {
  return { domain, paths, exclude }
}
