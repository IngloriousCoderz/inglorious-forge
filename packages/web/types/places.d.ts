import type { BaseEntity, Stored } from "@inglorious/store"

import type { Api } from "./mount"

/** A point on the map. */
export interface Coordinates {
  lat: number
  lng: number
}

/** A place a search found, ready to be a Combobox option. */
export interface Place {
  /** Unique per place, such as OpenStreetMap's `W42`. */
  value: string
  /** What the option shows: "Villa Medicea La Ferdinanda, Carmignano, Toscana". */
  label: string
  lat: number
  lng: number
  /** What sort of place it is, such as `city`, `house` or `attraction`. */
  kind: string | null
  name: string | null
  street: string | null
  houseNumber: string | null
  postcode: string | null
  city: string | null
  /** The first level under the country: a region, state or province. */
  region: string | null
  country: string | null
  /** ISO 3166-1 alpha-2, uppercase: `IT`. */
  countryCode: string | null
  [key: string]: unknown
}

export interface PlaceQuery {
  text: string
  /** Places near here come first. */
  near?: Coordinates
  /** What to name places in, such as `en`. */
  language?: string
}

/** Everything vendor-specific about finding places. */
export interface PlaceAdapter {
  search(query: PlaceQuery): Promise<Place[]>
}

export interface PlaceSearchConfig {
  adapter: PlaceAdapter
  /** Milliseconds of pause in typing before a search. Defaults to 300. */
  delay?: number
  /** Characters a search needs. Defaults to 3. */
  minLength?: number
  near?: Coordinates
  language?: string
}

/** What the place search adds to a Combobox entity. */
export interface PlaceSearchEntity {
  /** Overrides the config's `near`, such as with the device's position. */
  near?: Coordinates
  /** Overrides the config's `language`. */
  language?: string
  placesStatus?: "idle" | "loading" | "success" | "error"
  placesError?: string | null
}

/** The handlers the place search adds or wraps, by event name. */
export type PlaceSearchBehavior<
  TEntity extends BaseEntity = BaseEntity,
  TApi extends Api = Api,
> = {
  [handler: string]: (
    entity: Stored<TEntity>,
    payload: unknown,
    api: TApi,
  ) => unknown
}

/**
 * Turns a Combobox from `@inglorious/ui` into a place search: put it after the
 * Combobox in the type's array.
 */
export declare function createPlaceSearch<
  TEntity extends BaseEntity = BaseEntity,
  TApi extends Api = Api,
>(
  config: PlaceSearchConfig,
): (type: object) => PlaceSearchBehavior<TEntity, TApi>

export interface PhotonConfig {
  /** Another Photon server. Defaults to komoot's public one. */
  url?: string
  /** Places per search. Defaults to 5. */
  limit?: number
  /** The languages the server names places in. Defaults to en, fr, de. */
  languages?: string[]
  fetch?: typeof fetch
}

/** Finds places over Photon: OpenStreetMap, free and with no key. */
export declare function photonPlaces(config?: PhotonConfig): PlaceAdapter
