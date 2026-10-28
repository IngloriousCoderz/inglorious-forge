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
  vi.stubGlobal("document", { documentElement: { lang: "", dir: "" } })
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

  it("starts a server-rendered page in its language, ahead of the saved choice and the device", () => {
    stubBrowser({ languages: ["en"], saved: { lang: "en" } })
    document.documentElement.lang = "it-IT"
    const { I18n, t } = createI18n({
      resources,
      isServerRendered: true,
      storageKey: "lang",
    })
    const entity = {}

    I18n.create(entity)

    expect(entity.locale).toBe("it")
    expect(document.documentElement.lang).toBe("it")
    expect(t("hello")).toBe("Ciao")
  })

  it("detects the locale when the page's language is unsupported", () => {
    stubBrowser({ languages: ["it"] })
    document.documentElement.lang = "de"
    const { I18n } = createI18n({ resources, isServerRendered: true })
    const entity = {}

    I18n.create(entity)

    expect(entity.locale).toBe("it")
  })

  it("ignores the language of a page that is not server-rendered", () => {
    stubBrowser({ languages: ["it"] })
    document.documentElement.lang = "en"
    const { I18n } = createI18n({ resources })
    const entity = {}

    I18n.create(entity)

    expect(entity.locale).toBe("it")
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

describe("loadLocale", () => {
  const { en, it: italian } = resources

  // A loader whose loads resolve or fail when the test says so.
  function controlledLoader() {
    const loads = {}
    const loadLocale = vi.fn(
      (locale) =>
        new Promise((resolve, reject) => {
          loads[locale] = { resolve, reject }
        }),
    )
    return { loads, loadLocale }
  }

  function createI18nStore(options) {
    const i18n = createI18n({
      resources: { en },
      locales: ["en", "it", "fr"],
      ...options,
    })
    const store = createStore({
      types: { I18n: i18n.I18n },
      entities: { i18n: { type: "I18n" } },
    })
    store.notify("init")
    return { ...i18n, store }
  }

  const settle = () => new Promise((resolve) => setTimeout(resolve))

  it("loads the starting locale before ready resolves", async () => {
    stubBrowser({ languages: ["it-IT"] })
    const { ready, t } = createI18n({
      resources: { en },
      locales: ["en", "it"],
      loadLocale: async () => italian,
    })

    await ready

    expect(t("hello")).toBe("Ciao")
  })

  it("loads only the server-rendered page's locale, not the device's", async () => {
    stubBrowser({ languages: ["fr-FR"] })
    document.documentElement.lang = "it"
    const loadLocale = vi.fn(async () => italian)
    const { ready, t } = createI18n({
      resources: { en },
      locales: ["en", "it", "fr"],
      isServerRendered: true,
      loadLocale,
    })

    await ready

    expect(loadLocale).toHaveBeenCalledTimes(1)
    expect(loadLocale).toHaveBeenCalledWith("it")
    expect(t("hello")).toBe("Ciao")
  })

  it("is ready at once when the starting locale is bundled", async () => {
    stubBrowser({ languages: ["en"] })
    const loadLocale = vi.fn()
    const { ready } = createI18n({ resources: { en }, loadLocale })

    await ready

    expect(loadLocale).not.toHaveBeenCalled()
  })

  it("loads a locale before switching to it", async () => {
    stubBrowser({ languages: ["en"] })
    const { loads, loadLocale } = controlledLoader()
    const { store, t } = createI18nStore({ loadLocale })

    store.notify("#i18n:localeChange", "it")

    expect(store.getState().i18n.locale).toBe("en")
    expect(store.getState().i18n.loadingLocale).toBe("it")
    expect(t("hello")).toBe("Hello")

    loads.it.resolve(italian)
    await settle()

    expect(store.getState().i18n.locale).toBe("it")
    expect(store.getState().i18n.loadingLocale).toBe(null)
    expect(t("hello")).toBe("Ciao")
  })

  it("switches only to the latest choice", async () => {
    stubBrowser({ languages: ["en"] })
    const { loads, loadLocale } = controlledLoader()
    const { store } = createI18nStore({ loadLocale })

    store.notify("#i18n:localeChange", "it")
    store.notify("#i18n:localeChange", "fr")
    loads.fr.resolve({ translation: { hello: "Bonjour" } })
    await settle()
    loads.it.resolve(italian)
    await settle()

    expect(store.getState().i18n.locale).toBe("fr")
  })

  it("loads each locale once", async () => {
    stubBrowser({ languages: ["en"] })
    const loadLocale = vi.fn(async () => italian)
    const { store } = createI18nStore({ loadLocale })

    store.notify("#i18n:localeChange", "it")
    await settle()
    store.notify("#i18n:localeChange", "en")
    store.notify("#i18n:localeChange", "it")

    expect(store.getState().i18n.locale).toBe("it")
    expect(loadLocale).toHaveBeenCalledTimes(1)
  })

  it("waits for the starting locale when asked for it while it loads", async () => {
    stubBrowser({ languages: ["it-IT"] })
    const { loads, loadLocale } = controlledLoader()
    const { store, t } = createI18nStore({ loadLocale })

    store.notify("#i18n:localeChange", "it")

    expect(store.getState().i18n.loadingLocale).toBe("it")

    loads.it.resolve(italian)
    await settle()

    expect(store.getState().i18n.loadingLocale).toBe(null)
    expect(t("hello")).toBe("Ciao")
  })

  it("switches the shared instance back for a store already in the locale", () => {
    stubBrowser({ languages: ["en"] })
    const { I18n, t } = createI18n({ resources })
    const createI18nStoreOf = () =>
      createStore({
        types: { I18n },
        entities: { i18n: { type: "I18n" } },
      })
    const english = createI18nStoreOf()
    const italianStore = createI18nStoreOf()

    italianStore.notify("#i18n:localeChange", "it")
    expect(t("hello")).toBe("Ciao")

    english.notify("#i18n:localeChange", "en")
    expect(t("hello")).toBe("Hello")
  })

  it("keeps the current locale when a load fails, and tries again later", async () => {
    stubBrowser({ languages: ["en"] })
    vi.spyOn(console, "warn").mockImplementation(() => {})
    const { loads, loadLocale } = controlledLoader()
    const { store } = createI18nStore({ loadLocale })

    store.notify("#i18n:localeChange", "it")
    loads.it.reject(new Error("offline"))
    await settle()

    expect(store.getState().i18n.locale).toBe("en")
    expect(store.getState().i18n.loadingLocale).toBe(null)

    store.notify("#i18n:localeChange", "it")
    loads.it.resolve(italian)
    await settle()

    expect(store.getState().i18n.locale).toBe("it")
    expect(loadLocale).toHaveBeenCalledTimes(2)
  })
})

describe("catalogues", () => {
  const { en, it: italian } = resources

  it("takes a lazy glob: a locale per file, loaded when needed", async () => {
    stubBrowser({ languages: ["it-IT"] })
    const load = {
      en: vi.fn(async () => ({ default: en.translation })),
      it: vi.fn(async () => ({ default: italian.translation })),
      fr: vi.fn(),
    }
    const { I18n, ready, t } = createI18n({
      catalogues: {
        "./locales/en.json": load.en,
        "./locales/fr.json": load.fr,
        "./locales/it.json": load.it,
      },
      defaultLocale: "en",
    })
    const entity = {}
    I18n.create(entity)

    expect(entity.locales).toEqual(["en", "fr", "it"])

    await ready

    expect(t("hello")).toBe("Ciao")
    expect(load.en).toHaveBeenCalled()
    expect(load.fr).not.toHaveBeenCalled()
  })

  it("takes an eager glob: every catalogue bundled", () => {
    stubBrowser({ languages: ["en"] })
    const { I18n, t } = createI18n({
      catalogues: {
        "./locales/en.json": { default: en.translation },
        "./locales/it.json": { default: italian.translation },
      },
    })
    const entity = {}
    I18n.create(entity)

    I18n.localeChange(entity, "it")

    expect(t("hello")).toBe("Ciao")
  })
})

describe("languages", () => {
  it("names each language in itself, for a picker", () => {
    stubBrowser({ languages: ["en"] })
    const { languages } = createI18n({ resources, locales: ["en", "it", "fr"] })

    expect(languages).toEqual([
      { value: "en", label: "English" },
      { value: "it", label: "Italiano" },
      { value: "fr", label: "Français" },
    ])
  })

  it("takes a picker's { value } as the locale", () => {
    stubBrowser({ languages: ["en"] })
    const { I18n } = createI18n({ resources })
    const entity = {}
    I18n.create(entity)

    I18n.localeChange(entity, { value: "it" })

    expect(entity.locale).toBe("it")
  })
})

describe("saveUserLocale", () => {
  function setup() {
    stubBrowser({ languages: ["en"] })
    const saveUserLocale = vi.fn()
    const { I18n } = createI18n({ resources, saveUserLocale })
    const api = { notify: vi.fn() }
    const entity = { id: "i18n" }
    I18n.create(entity)
    return { I18n, entity, api, saveUserLocale }
  }

  it("saves a change at once for a signed-in user", () => {
    const { I18n, entity, api, saveUserLocale } = setup()
    I18n.userLocaleLoad(entity, { userId: "u1", locale: "en" }, api)

    I18n.localeChange(entity, "it", api)

    expect(saveUserLocale).toHaveBeenCalledWith("it", api)
  })

  it("applies the user's saved locale", () => {
    const { I18n, entity, api, saveUserLocale } = setup()

    I18n.userLocaleLoad(entity, { userId: "u1", locale: "it" }, api)

    expect(entity.locale).toBe("it")
    expect(saveUserLocale).not.toHaveBeenCalled()
  })

  it("saves a choice made before signing in instead", () => {
    const { I18n, entity, api, saveUserLocale } = setup()
    I18n.localeChange(entity, "it", api)

    expect(saveUserLocale).not.toHaveBeenCalled()

    I18n.userLocaleLoad(entity, { userId: "u1", locale: "en" }, api)

    expect(entity.locale).toBe("it")
    expect(saveUserLocale).toHaveBeenCalledWith("it", api)
  })

  it("saves the current locale for a user with none", () => {
    const { I18n, entity, api, saveUserLocale } = setup()

    I18n.userLocaleLoad(entity, { userId: "u1", locale: null }, api)

    expect(saveUserLocale).toHaveBeenCalledWith("en", api)
  })

  it("applies once per user", () => {
    const { I18n, entity, api } = setup()
    I18n.userLocaleLoad(entity, { userId: "u1", locale: "it" }, api)
    I18n.localeChange(entity, "en", api)

    I18n.userLocaleLoad(entity, { userId: "u1", locale: "it" }, api)

    expect(entity.locale).toBe("en")
  })

  it("keeps choices made after signing out for the next user", () => {
    const { I18n, entity, api, saveUserLocale } = setup()
    I18n.userLocaleLoad(entity, { userId: "u1", locale: "en" }, api)
    I18n.userLocaleClear(entity)

    I18n.localeChange(entity, "it", api)

    expect(saveUserLocale).not.toHaveBeenCalled()
    expect(entity.isUnsaved).toBe(true)
  })
})

describe("direction", () => {
  it("sets the direction of the language, on the entity and the document", () => {
    stubBrowser({ languages: ["en"] })
    const { I18n } = createI18n({
      resources: { ...resources, ar: { translation: { hello: "مرحبا" } } },
    })
    const entity = {}
    I18n.create(entity)

    expect(entity.dir).toBe("ltr")
    expect(document.documentElement.dir).toBe("ltr")

    I18n.localeChange(entity, "ar")

    expect(entity.dir).toBe("rtl")
    expect(document.documentElement.dir).toBe("rtl")
  })
})

describe("helpers", () => {
  it("labels data in the active language, and keeps the key", () => {
    stubBrowser({ languages: ["en"] })
    const { I18n, labelled, translatedLabel, currentLocale } = createI18n({
      resources,
    })
    const entity = {}
    I18n.create(entity)
    const option = labelled("hello", { value: "greeting" })

    expect(option.label).toBe("Hello")

    I18n.localeChange(entity, "it")

    expect(option.label).toBe("Ciao")
    expect(currentLocale()).toBe("it")
    expect(translatedLabel({ ...option })).toBe("Ciao")
    expect(translatedLabel({ label: "Lombardy" })).toBe("Lombardy")
  })
})
