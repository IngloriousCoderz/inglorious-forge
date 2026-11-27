const PHOTON_URL = "https://photon.komoot.io/api/"
const MAX_RESULTS = 5
// What komoot's public Photon names places in; elsewhere, the local names.
const PHOTON_LANGUAGES = ["en", "fr", "de"]
// Where the house number goes before the street.
const NUMBER_FIRST = new Set(["AU", "CA", "FR", "GB", "IE", "NZ", "US"])
const CITY_KINDS = new Set(["city", "town", "village", "hamlet"])

/**
 * A place search adapter over Photon: OpenStreetMap, made for search as you
 * type, free and with no key. komoot's public server asks for fair use, which
 * `createPlaceSearch`'s pause and minimum length keep; point `url` at another
 * server for more.
 *
 * @param {Object} [config]
 * @param {string} [config.url]
 * @param {number} [config.limit] - places per search.
 * @param {string[]} [config.languages] - those the server names places in.
 * @param {typeof fetch} [config.fetch]
 *
 * @example
 * createPlaceSearch({ adapter: photonPlaces() })
 */
export function photonPlaces({
  url = PHOTON_URL,
  limit = MAX_RESULTS,
  languages = PHOTON_LANGUAGES,
  fetch: fetchJson = (...args) => globalThis.fetch(...args),
} = {}) {
  return {
    async search({ text, near, language }) {
      const query = new URL(url)
      query.searchParams.set("q", text)
      query.searchParams.set("limit", String(limit))
      if (near) {
        query.searchParams.set("lat", String(near.lat))
        query.searchParams.set("lon", String(near.lng))
      }
      const [lang] = language?.split("-") ?? []
      if (languages.includes(lang)) query.searchParams.set("lang", lang)

      const response = await fetchJson(query)
      if (!response.ok) throw new Error(`Photon answered ${response.status}`)
      const { features = [] } = await response.json()
      return uniqueByLabel(features.map(toPlace))
    },
  }
}

/**
 * A place from one of Photon's GeoJSON features: "Villa Medicea La Ferdinanda,
 * Carmignano, Toscana", or "Via Roma 10, Firenze, Toscana".
 * @param {{ geometry: { coordinates: [number, number] }, properties: Object }} feature
 */
export function toPlace({ geometry, properties }) {
  const {
    osm_type: osmType,
    osm_id: osmId,
    type: kind,
    name,
    street,
    housenumber: houseNumber,
    postcode,
    locality,
    district,
    county,
    state,
    country,
    countrycode,
  } = properties
  const countryCode = countrycode?.toUpperCase() ?? null
  const address = [street, houseNumber].filter(Boolean)
  if (NUMBER_FIRST.has(countryCode)) address.reverse()
  const city =
    properties.city ?? (CITY_KINDS.has(kind) ? name : null) ?? locality ?? null

  const label = [
    ...new Set(
      [
        name ?? address.join(" "),
        city ?? district ?? county,
        state ?? country,
      ].filter(Boolean),
    ),
  ].join(", ")
  const [lng, lat] = geometry.coordinates

  return {
    value: osmType && osmId ? `${osmType}${osmId}` : label,
    label,
    kind: kind ?? null,
    name: name ?? null,
    street: street ?? null,
    houseNumber: houseNumber ?? null,
    postcode: postcode ?? null,
    city,
    region: state ?? null,
    country: country ?? null,
    countryCode,
    lat,
    lng,
  }
}

function uniqueByLabel(places) {
  const seen = new Set()
  return places.filter(({ label }) => {
    if (seen.has(label)) return false
    seen.add(label)
    return true
  })
}
