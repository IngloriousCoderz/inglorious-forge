const WILDCARD = "*"
const FRAGMENT = "#"
const START = 0

/**
 * The `apple-app-site-association` file iOS reads from the app's domain:
 * excluded patterns first, since iOS stops at the first match.
 *
 * @param {{ appId: string, teamId: string, appLinks: { paths: string[], exclude: string[] } }} settings
 */
export function appSiteAssociation({ appId, teamId, appLinks }) {
  return {
    applinks: {
      details: [
        {
          appIDs: [`${teamId}.${appId}`],
          components: [
            ...appLinks.exclude.map((pattern) => ({
              ...component(pattern),
              exclude: true,
            })),
            ...appLinks.paths.map(component),
          ],
        },
      ],
    },
  }
}

/**
 * The `assetlinks.json` file Android reads from the app's domain: the
 * fingerprints of the keys that sign the app.
 *
 * @param {{ appId: string, sha256: string[] }} settings
 */
export function assetLinks({ appId, sha256 }) {
  return [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: appId,
        sha256_cert_fingerprints: sha256,
      },
    },
  ]
}

/**
 * The `<data>` elements of an App Links intent filter. Android can't exclude
 * a path, so only `paths` make it: `/jobs*` matches every path that starts
 * with `/jobs`, `/` only the root.
 *
 * @param {{ domain: string, paths: string[] }} appLinks
 */
export function intentFilterData({ domain, paths }) {
  return [
    { "android:scheme": "https", "android:host": domain },
    ...paths.filter((pattern) => pattern.startsWith("/")).map(pathData),
  ]
}

function component(pattern) {
  if (pattern.startsWith(FRAGMENT))
    return { "#": pattern.slice(FRAGMENT.length) }
  return { "/": pattern }
}

function pathData(pattern) {
  if (!pattern.includes(WILDCARD)) return { "android:path": pattern }

  const prefix = pattern.slice(START, -WILDCARD.length)
  if (pattern.endsWith(WILDCARD) && !prefix.includes(WILDCARD)) {
    return { "android:pathPrefix": prefix }
  }
  return { "android:pathPattern": pattern.replaceAll(WILDCARD, ".*") }
}
