import {
  type BaseEntity,
  createStore,
  type EntitiesState,
} from "@inglorious/store"

import {
  createPlaceSearch,
  photonPlaces,
  type Place,
  type PlaceAdapter,
  type PlaceSearchEntity,
} from "../types/places"

interface VenueEntity extends BaseEntity, PlaceSearchEntity {
  type: "PlaceSearch"
}

interface AppState extends EntitiesState<VenueEntity> {
  venue: VenueEntity
}

const Combobox = {
  optionsSet(entity: VenueEntity, options: Place[]) {
    void entity
    void options
  },
}

const custom: PlaceAdapter = {
  async search({ text, near }) {
    return [
      {
        value: text,
        label: text,
        lat: near?.lat ?? 0,
        lng: near?.lng ?? 0,
        kind: null,
        name: null,
        street: null,
        houseNumber: null,
        postcode: null,
        city: null,
        region: "Toscana",
        country: null,
        countryCode: "IT",
      },
    ]
  },
}

export const store = createStore<VenueEntity, AppState>({
  types: {
    PlaceSearch: [
      Combobox,
      createPlaceSearch({ adapter: photonPlaces({ limit: 3 }) }),
    ],
  },
  entities: {
    venue: { type: "PlaceSearch", near: { lat: 43.8, lng: 11.1 } },
  },
})

createPlaceSearch({ adapter: custom, minLength: 2, delay: 500 })

// @ts-expect-error: an adapter is required
createPlaceSearch({})
// @ts-expect-error: coordinates are numbers
photonPlaces().search({ text: "a", near: { lat: "43", lng: "11" } })
