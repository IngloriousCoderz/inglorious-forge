import { describe, expect, it } from "vitest"

import {
  appSiteAssociation,
  assetLinks,
  intentFilterData,
} from "./well-known.js"

describe("appSiteAssociation", () => {
  it("lists exclusions first, then the paths that open the app", () => {
    const association = appSiteAssociation({
      appId: "com.example.app",
      teamId: "ABCDE12345",
      appLinks: {
        paths: ["/jobs*"],
        exclude: ["#*access_token*", "/onboarding*"],
      },
    })

    expect(association.applinks.details).toEqual([
      {
        appIDs: ["ABCDE12345.com.example.app"],
        components: [
          { "#": "*access_token*", exclude: true },
          { "/": "/onboarding*", exclude: true },
          { "/": "/jobs*" },
        ],
      },
    ])
  })
})

describe("assetLinks", () => {
  it("names the package and the signing keys", () => {
    expect(assetLinks({ appId: "com.example.app", sha256: ["AA:BB"] })).toEqual(
      [
        {
          relation: ["delegate_permission/common.handle_all_urls"],
          target: {
            namespace: "android_app",
            package_name: "com.example.app",
            sha256_cert_fingerprints: ["AA:BB"],
          },
        },
      ],
    )
  })
})

describe("intentFilterData", () => {
  it("turns patterns into exact paths, prefixes and patterns", () => {
    expect(
      intentFilterData({
        domain: "app.example.com",
        paths: ["/", "/*", "/jobs*", "/jobs/*/edit"],
      }),
    ).toEqual([
      { "android:scheme": "https", "android:host": "app.example.com" },
      { "android:path": "/" },
      { "android:pathPrefix": "/" },
      { "android:pathPrefix": "/jobs" },
      { "android:pathPattern": "/jobs/.*/edit" },
    ])
  })
})
