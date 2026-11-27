---
title: Place Search
description: Search places as the user types, with a Combobox from Inglorious UI and an adapter such as Photon
---

# Place Search

`createPlaceSearch` turns a [Combobox](/featured/ui) from `@inglorious/ui` into a place search. Put it after the Combobox in the type's array: the Combobox becomes remote, each search goes to an adapter once typing pauses, and the places it finds become the options.

`photonPlaces` is an adapter over [Photon](https://photon.komoot.io): OpenStreetMap, made for search as you type, free and with no key.

## Usage

```javascript
import { createStore } from "@inglorious/store"
import { Combobox } from "@inglorious/ui/combobox"
import { createPlaceSearch, photonPlaces } from "@inglorious/web/places"

const store = createStore({
  types: {
    PlaceSearch: [Combobox, createPlaceSearch({ adapter: photonPlaces() })],
    JobForm: {
      placeChange(entity, { options: [place] }) {
        entity.place = place ?? null
      },
    },
  },
  entities: {
    jobForm: { type: "JobForm" },
    venue: {
      type: "PlaceSearch",
      label: "Where",
      noOptionsMessage: "Type a place",
      changeEvent: "#jobForm:placeChange",
    },
  },
})
```

A pick notifies the Combobox's `changeEvent` with the place whole in `options`, alongside its `value`. Clearing the Combobox notifies an empty `options`.

## Places

Each place is a Combobox option with what an app usually keeps of it:

```javascript
{
  value: "W42", // unique per place
  label: "Villa Medicea La Ferdinanda, Carmignano, Toscana",
  kind: "attraction", // or city, street, house…
  name: "Villa Medicea La Ferdinanda",
  street: "Viale Papa Giovanni XXIII",
  houseNumber: null,
  postcode: null,
  city: "Carmignano",
  region: "Toscana", // the first level under the country
  country: "Italia",
  countryCode: "IT",
  lat: 43.78,
  lng: 11.08,
}
```

## Options

```javascript
createPlaceSearch({
  adapter, // required
  delay: 300, // ms of pause in typing before a search
  minLength: 3, // characters a search needs: shorter ones find nothing, for free
  near: { lat: 43.77, lng: 11.25 }, // places near here come first
  language: "en", // what to name places in
})

photonPlaces({
  url: "https://photon.komoot.io/api/", // another Photon server
  limit: 5, // places per search
  languages: ["en", "fr", "de"], // those the server names places in; others get local names
})
```

The entity's own `near` and `language` win over the config's, so a Combobox can follow the device's position from [`createGeolocation`](/featured/geolocation).

## Entity State

On top of the Combobox's own fields:

- `isRemote` — always `true`
- `placesStatus` — `"loading"`, `"success"` or `"error"`, for the latest search
- `placesError` — the latest search's error message. The Combobox's `error` stays its validation message.

Only the answer to the latest search is shown: one the search moved on from, or that arrives once the Combobox closed, is dropped.

## Adapters

An adapter is an object with `search({ text, near, language })` resolving to places. One for another service maps its results to the shape above:

```javascript
const myPlaces = {
  async search({ text, near, language }) {
    const results = await myGeocoder.find(text, { near, language })
    return results.map(toPlace)
  },
}
```

komoot's public Photon server asks for fair use, which the pause and the minimum length keep. An app with heavy traffic points `url` at a Photon server of its own.
