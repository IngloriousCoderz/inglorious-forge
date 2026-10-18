import { createStore } from "@inglorious/store"
import { afterEach, describe, expect, it, vi } from "vitest"

import { createI18n, detectLocale } from "./index.js"

const resources = {
  en: {
    translation: {
      hello: "Hello",
      greet: "Hello, {{name}}",
      event_one: "{{count}} event",
      event_other: "{{count}} events",
    },
  },
  it: {
    translation: {
      hello: "Ciao",
      greet: "Ciao, {{name}}",
      event_one: "{{count}} evento",
      event_other: "{{count}} eventi",
    },
  },
}

function stubBrowser({ languages = [], saved = {} } = {}) {
  const store = { ...saved }
  vi.stubGlobal("navigator", { languages, language: languages[0] })
  vi.stubGlobal("localStorage", {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => {
      store[key] = value
    },
  })
  vi.stubGlobal("document", { documentElement: { lang: "" } })
  return store
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("detectLocale", () => {
  const options = {
    locales: ["en", "it"],
    defaultLocale: "en",
    storageKey: "lang",
  }

  it("prefers the locale the user chose before", () => {
    stubBrowser({ languages: ["en-US"], saved: { lang: "it" } })
    expect(detectLocale(options)).toBe("it")
  })

  it("matches a device language by its base language", () => {
    stubBrowser({ languages: ["fr-FR", "it-CH"] })
    expect(detectLocale(options)).toBe("it")
  })

  it("falls back to the default when nothing matches", () => {
    stubBrowser({ languages: ["fr-FR"] })
    expect(detectLocale(options)).toBe("en")
  })

  it("ignores a saved locale that is no longer supported", () => {
    stubBrowser({ languages: ["en"], saved: { lang: "de" } })
    expect(detectLocale(options)).toBe("en")
  })
})

describe("createI18n", () => {
  it("translates with interpolation and plurals", () => {
    stubBrowser({ languages: ["en"] })
    const { t } = createI18n({ resources })

    expect(t("greet", { name: "Ada & Grace" })).toBe("Hello, Ada & Grace")
    expect(t("event", { count: 1 })).toBe("1 event")
    expect(t("event", { count: 3 })).toBe("3 events")
  })

  it("starts in the device language and sets the document language", () => {
    stubBrowser({ languages: ["it-IT"] })
    const { I18n } = createI18n({ resources })
    const entity = {}

    I18n.create(entity)

    expect(entity.locale).toBe("it")
    expect(entity.locales).toEqual(["en", "it"])
    expect(document.documentElement.lang).toBe("it")
  })

  it("switches language, remembers it and ignores unsupported ones", () => {
    const saved = stubBrowser({ languages: ["en"] })
    const { I18n, t } = createI18n({ resources, storageKey: "lang" })
    const entity = {}
    I18n.create(entity)

    I18n.localeChange(entity, "it")
    expect(entity.locale).toBe("it")
    expect(t("hello")).toBe("Ciao")
    expect(saved.lang).toBe("it")
    expect(document.documentElement.lang).toBe("it")

    I18n.localeChange(entity, "de")
    expect(entity.locale).toBe("it")
  })

  it("drives a store: an event switches every later translation", () => {
    stubBrowser({ languages: ["en"] })
    const { I18n, t } = createI18n({ resources })
    const store = createStore({
      types: { I18n },
      entities: { i18n: { type: "I18n" } },
    })
    store.notify("init")

    expect(store.getState().i18n.locale).toBe("en")
    expect(t("hello")).toBe("Hello")

    store.notify("#i18n:localeChange", "it")

    expect(store.getState().i18n.locale).toBe("it")
    expect(t("hello")).toBe("Ciao")
  })
})
