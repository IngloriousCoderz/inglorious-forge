import { createStore } from "@inglorious/store"
import { describe, expect, it, vi } from "vitest"

import { createPlaceSearch, photonPlaces } from "./index.js"
import { toPlace } from "./photon.js"

const DELAY_MS = 10
const SETTLE_MS = 40

const FERDINANDA = { value: "W1", label: "Villa Medicea La Ferdinanda" }
const ARTIMINO = { value: "N2", label: "Artimino" }

// What the place search needs of a Combobox.
const Combobox = {
  create(entity) {
    entity.searchTerm ??= ""
    entity.options ??= []
    entity.isLoading ??= false
  },
  searchChange(entity, searchTerm) {
    entity.searchTerm = searchTerm
  },
  optionsSet(entity, options) {
    entity.options = options
  },
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function setup(search, config = {}, entity = {}) {
  const adapter = { search: vi.fn(search) }
  const store = createStore({
    types: {
      PlaceSearch: [
        Combobox,
        createPlaceSearch({ adapter, delay: DELAY_MS, ...config }),
      ],
    },
    entities: { venue: { type: "PlaceSearch", ...entity } },
  })
  const type = (text) => {
    store.notify("#venue:searchChange", text)
    store.update()
  }
  const settle = async () => {
    await wait(SETTLE_MS)
    store.update()
  }
  return { adapter, store, type, settle, venue: () => store.getState().venue }
}

describe("createPlaceSearch", () => {
  it("makes the combobox remote", () => {
    const { venue } = setup(async () => [])

    expect(venue().isRemote).toBe(true)
  })

  it("searches once typing pauses, and lists what it finds", async () => {
    const { adapter, type, settle, venue } = setup(async () => [FERDINANDA], {
      near: { lat: 43.8, lng: 11.1 },
      language: "en",
    })

    type("art")
    type("artim")
    type("artimino villa")
    await settle()

    expect(adapter.search).toHaveBeenCalledTimes(1)
    expect(adapter.search).toHaveBeenCalledWith({
      text: "artimino villa",
      near: { lat: 43.8, lng: 11.1 },
      language: "en",
    })
    expect(venue().options).toEqual([FERDINANDA])
    expect(venue().isLoading).toBe(false)
  })

  it("prefers the entity's own position and language", async () => {
    const { adapter, type, settle } = setup(
      async () => [],
      { near: { lat: 0, lng: 0 }, language: "en" },
      { near: { lat: 51, lng: -114 }, language: "fr" },
    )

    type("calgary")
    await settle()

    expect(adapter.search).toHaveBeenCalledWith({
      text: "calgary",
      near: { lat: 51, lng: -114 },
      language: "fr",
    })
  })

  it("finds nothing, for free, in a search too short", async () => {
    const { adapter, store, type, settle, venue } = setup(async () => [
      ARTIMINO,
    ])

    type("artimino")
    await settle()
    type("ar")
    await settle()

    expect(adapter.search).toHaveBeenCalledTimes(1)
    expect(venue().options).toEqual([])
    expect(store.getState().venue.isLoading).toBe(false)
  })

  it("drops an answer the search moved on from", async () => {
    let answer
    const { type, settle, store, venue } = setup(
      () => new Promise((resolve) => (answer = resolve)),
    )

    type("artimino")
    await settle()
    store.notify("#venue:searchChange", "")
    store.update()
    answer([ARTIMINO])
    await settle()

    expect(venue().options).toEqual([])
  })

  it("keeps a failure in its own fields", async () => {
    const { type, settle, venue } = setup(async () => {
      throw new Error("offline")
    })

    type("artimino")
    await settle()

    expect(venue().placesError).toBe("offline")
    expect(venue().error).toBeUndefined()
    expect(venue().isLoading).toBe(false)
  })
})

describe("photonPlaces", () => {
  const feature = (properties, coordinates = [11.1, 43.8]) => ({
    geometry: { coordinates },
    properties,
  })

  function photon(features, config = {}) {
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ features }),
    }))
    return { fetch, adapter: photonPlaces({ fetch, ...config }) }
  }

  it("asks Photon near a point, in a language it knows", async () => {
    const { fetch, adapter } = photon([])

    await adapter.search({
      text: "artimino",
      near: { lat: 43.8, lng: 11.1 },
      language: "en-GB",
    })

    const url = fetch.mock.lastCall[0]
    expect(url.origin + url.pathname).toBe("https://photon.komoot.io/api/")
    expect(Object.fromEntries(url.searchParams)).toEqual({
      q: "artimino",
      limit: "5",
      lat: "43.8",
      lon: "11.1",
      lang: "en",
    })
  })

  it("leaves the language out when Photon doesn't know it", async () => {
    const { fetch, adapter } = photon([])

    await adapter.search({ text: "artimino", language: "it" })

    expect(fetch.mock.lastCall[0].searchParams.has("lang")).toBe(false)
  })

  it("lists each label once", async () => {
    const { adapter } = photon([
      feature({ osm_type: "N", osm_id: 1, name: "Artimino", state: "Toscana" }),
      feature({ osm_type: "W", osm_id: 2, name: "Artimino", state: "Toscana" }),
    ])

    const places = await adapter.search({ text: "artimino" })

    expect(places.map(({ value }) => value)).toEqual(["N1"])
  })

  it("throws when Photon fails", async () => {
    const fetch = vi.fn(async () => ({ ok: false, status: 503 }))

    await expect(
      photonPlaces({ fetch }).search({ text: "artimino" }),
    ).rejects.toThrow("Photon answered 503")
  })
})

describe("toPlace", () => {
  it("names a venue by its name, town and region", () => {
    expect(
      toPlace({
        geometry: { coordinates: [11.08, 43.78] },
        properties: {
          osm_type: "W",
          osm_id: 42,
          type: "attraction",
          name: "Villa Medicea La Ferdinanda",
          street: "Viale Papa Giovanni XXIII",
          city: "Carmignano",
          state: "Toscana",
          country: "Italia",
          countrycode: "it",
        },
      }),
    ).toEqual({
      value: "W42",
      label: "Villa Medicea La Ferdinanda, Carmignano, Toscana",
      kind: "attraction",
      name: "Villa Medicea La Ferdinanda",
      street: "Viale Papa Giovanni XXIII",
      houseNumber: null,
      postcode: null,
      city: "Carmignano",
      region: "Toscana",
      country: "Italia",
      countryCode: "IT",
      lat: 43.78,
      lng: 11.08,
    })
  })

  it("puts the house number where the country does", () => {
    const address = (countrycode, street, housenumber) =>
      toPlace({
        geometry: { coordinates: [0, 0] },
        properties: { street, housenumber, countrycode, city: "X" },
      }).label

    expect(address("it", "Via Roma", "10")).toBe("Via Roma 10, X")
    expect(address("ca", "16 Avenue NW", "1301")).toBe("1301 16 Avenue NW, X")
  })

  it("takes a town's own name as its city", () => {
    const place = toPlace({
      geometry: { coordinates: [0, 0] },
      properties: { type: "city", name: "Firenze", state: "Toscana" },
    })

    expect(place.city).toBe("Firenze")
    expect(place.label).toBe("Firenze, Toscana")
  })
})
