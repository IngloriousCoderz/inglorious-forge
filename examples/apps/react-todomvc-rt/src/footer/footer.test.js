import { it, expect } from "vitest"
import { trigger } from "@inglorious/store/test"

import { Footer } from "./footer"

it("should update the filter on filterClick", () => {
  const entityBefore = {
    id: "footer",
    type: "Footer",
    activeFilter: "all",
  }
  const event = { type: "filterClick", payload: "completed" }
  const entityAfter = {
    id: "footer",
    type: "Footer",
    activeFilter: "completed",
  }

  const { entity } = trigger(entityBefore, Footer[event.type], event.payload)

  expect(entity).toEqual(entityAfter)
})
