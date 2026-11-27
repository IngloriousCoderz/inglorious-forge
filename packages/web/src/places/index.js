import { handleRequest } from "@inglorious/store/async"

import { withDebounce } from "../decorators/with-debounce/index.js"

export { photonPlaces } from "./photon.js"

const SEARCH_DELAY_MS = 300
const MIN_SEARCH_LENGTH = 3

/**
 * The behavior that turns a Combobox from `@inglorious/ui` into a place
 * search: put it after the Combobox in the type's array. The Combobox becomes
 * remote, each search goes to the `adapter` once typing pauses, and the places
 * it finds become the options. A pick notifies the Combobox's `changeEvent`
 * with the place whole in `options`.
 *
 * Searches shorter than `minLength` find nothing and cost nothing. Only the
 * answer to the latest search is shown. Results come first near `near`, the
 * entity's or the config's, such as the position from `createGeolocation`.
 *
 * The adapter's `search({ text, near, language })` resolves to places
 * `{ value, label, lat, lng, ... }`: `photonPlaces()` searches OpenStreetMap.
 *
 * @param {Object} config
 * @param {Object} config.adapter
 * @param {number} [config.delay] - ms of pause in typing before a search.
 * @param {number} [config.minLength] - characters a search needs.
 * @param {{ lat: number, lng: number }} [config.near]
 * @param {string} [config.language] - what to name places in, such as "en".
 *
 * @example
 * import { Combobox } from "@inglorious/ui/combobox"
 * import { createPlaceSearch, photonPlaces } from "@inglorious/web/places"
 *
 * const types = {
 *   PlaceSearch: [Combobox, createPlaceSearch({ adapter: photonPlaces() })],
 * }
 * const entities = {
 *   venue: {
 *     type: "PlaceSearch",
 *     noOptionsMessage: "Type a place",
 *     changeEvent: "#jobForm:placeChange",
 *   },
 * }
 */
export function createPlaceSearch({
  adapter,
  delay = SEARCH_DELAY_MS,
  minLength = MIN_SEARCH_LENGTH,
  near,
  language,
}) {
  return (type) => {
    const behavior = {
      create(entity, payload, api) {
        entity.isRemote = true
        type.create?.(entity, payload, api)
      },

      searchChange(entity, searchTerm, api) {
        type.searchChange?.(entity, searchTerm, api)
        // A copy: the search runs after this update, when the draft is gone.
        const { lat, lng } = entity.near ?? near ?? {}
        api.notify(`#${entity.id}:placesLoad`, {
          text: searchTerm,
          near: lat === undefined ? undefined : { lat, lng },
          language: entity.language ?? language,
        })
      },

      // The Combobox's own `error` is its validation message: the search
      // keeps its state in fields of its own.
      ...handleRequest(
        "placesLoad",
        {
          async run(query) {
            const text = query.text.trim()
            const places =
              text.length < minLength
                ? []
                : await adapter.search({ ...query, text })
            return { text: query.text, places }
          },
          start(entity, { text }) {
            entity.isLoading = text.trim().length >= minLength
          },
          success(entity, { text, places }) {
            entity.isLoading = false
            // The Combobox closed, or its search moved on, meanwhile.
            if (text !== entity.searchTerm) return
            type.optionsSet(entity, places)
          },
          error(entity) {
            entity.isLoading = false
          },
        },
        { status: "placesStatus", error: "placesError" },
      ),
    }

    return {
      ...behavior,
      ...withDebounce(delay, ["placesLoad"])({ ...type, ...behavior }),
    }
  }
}
