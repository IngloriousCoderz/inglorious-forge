import { createStore } from "@inglorious/store"
import { describe, expect, it } from "vitest"

import {
  getLocaleFromPath,
  getTextDirection,
  selectLocale,
  waitForLocale,
} from "./i18n"

// Stands in for @inglorious/i18n: Italian loads later, English is loaded already.
function createTranslatorStore({ loads = {} } = {}) {
  const loaded = new Set(["en"])
  const I18n = {
    localeChange(entity, locale, api) {
      entity.loadingLocale = null
      if (loaded.has(locale)) {
        entity.locale = locale
        return
      }
      entity.loadingLocale = locale
      new Promise((resolve) => (loads[locale] = resolve)).then(() => {
        loaded.add(locale)
        api.notify("#i18n:localeLoadSuccess", locale)
      })
    },
    localeLoadSuccess(entity, locale) {
      entity.loadingLocale = null
      entity.locale = locale
    },
  }
  return createStore({
    types: { I18n },
    entities: { i18n: { type: "I18n", locale: "en", loadingLocale: null } },
  })
}

describe("getLocaleFromPath", () => {
  const config = { defaultLocale: "en", locales: ["en", "it", "ar"] }

  it("should read the locale from the first path segment", () => {
    expect(getLocaleFromPath("/it/about?x=1#top", config)).toBe("it")
  })

  it("should fall back to the default locale", () => {
    expect(getLocaleFromPath("/about", config)).toBe("en")
    expect(getLocaleFromPath("/fr/about", config)).toBe("en")
  })
})

describe("getTextDirection", () => {
  it("should be right to left for languages written in a right-to-left script", () => {
    for (const locale of ["ar", "he", "fa", "ur", "yi", "dv", "ar-EG"]) {
      expect(getTextDirection(locale)).toBe("rtl")
    }
  })

  it("should follow a script named in the locale", () => {
    expect(getTextDirection("az-Arab")).toBe("rtl")
    expect(getTextDirection("ks-Deva")).toBe("ltr")
  })

  it("should be left to right otherwise", () => {
    for (const locale of ["en", "it", "zh", "ja", "ru"]) {
      expect(getTextDirection(locale)).toBe("ltr")
    }
  })

  it("should be left to right without a valid locale", () => {
    expect(getTextDirection(undefined)).toBe("ltr")
    expect(getTextDirection("not a tag")).toBe("ltr")
  })
})

describe("waitForLocale", () => {
  it("should resolve once the locale's translations have loaded", async () => {
    const loads = {}
    const store = createTranslatorStore({ loads })
    let isDone = false

    const waiting = waitForLocale(store, "it").then(() => (isDone = true))
    await Promise.resolve()
    expect(isDone).toBe(false)

    loads.it()
    await waiting

    expect(store.getState().i18n.locale).toBe("it")
  })

  it("should resolve at once for a loaded locale", async () => {
    const store = createTranslatorStore()

    await waitForLocale(store, "en")

    expect(store.getState().i18n.locale).toBe("en")
  })

  it("should resolve at once for an app that does not translate", async () => {
    const store = createStore({ types: {}, entities: {} })

    await expect(waitForLocale(store, "it")).resolves.toBeUndefined()
  })
})

describe("selectLocale", () => {
  it("should switch the translations at once", () => {
    const store = createTranslatorStore()
    store.notify("#i18n:localeChange", "fr")

    selectLocale(store, "en")

    expect(store.getState().i18n.locale).toBe("en")
  })

  it("should leave an app that does not translate alone", () => {
    const store = createStore({ types: {}, entities: {} })

    expect(() => selectLocale(store, "it")).not.toThrow()
  })
})
